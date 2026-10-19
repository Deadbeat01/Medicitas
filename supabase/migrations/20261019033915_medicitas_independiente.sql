-- New independent MediCitas database. Historical migrations are archived separately.
create schema if not exists private;
create type public.user_type as enum ('patient','doctor','admin');
create type public.appointment_status as enum ('pending','confirmed','completed','cancelled');
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null, name text not null check(length(trim(name)) between 2 and 100),
 phone text check(phone is null or (length(phone)<=25 and phone ~ '^[+0-9 ()-]{7,25}$')),
 user_type public.user_type not null default 'patient', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.patients(id uuid primary key references public.profiles(id) on delete cascade, user_id uuid unique not null references public.profiles(id), name text not null, email text not null, phone text, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.specialties(id uuid primary key default gen_random_uuid(), name text not null unique, description text, created_at timestamptz default now());
create table public.hospitals(id uuid primary key default gen_random_uuid(), name text not null unique, address text, phone text, created_at timestamptz default now());
create table public.doctors(id uuid primary key references public.profiles(id) on delete cascade, user_id uuid unique not null references public.profiles(id), name text not null, email text not null, specialty_id uuid references public.specialties, hospital_id uuid references public.hospitals, available boolean not null default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.appointments(
 id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patients, doctor_id uuid not null references public.doctors,
 specialty_id uuid not null references public.specialties, hospital_id uuid not null references public.hospitals,
 patient_name text not null, email text not null, phone text not null default '', reason text not null check(length(trim(reason)) between 10 and 300),
 appointment_date date not null, appointment_time time not null, status public.appointment_status not null default 'pending',
 created_at timestamptz default now(), updated_at timestamptz default now(),
 constraint business_hours check(appointment_time in ('09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'))
);
create unique index appointments_unique_active_slot on public.appointments(doctor_id,appointment_date,appointment_time) where status in ('pending','confirmed');
create index appointments_patient_idx on public.appointments(patient_id);
create index appointments_doctor_idx on public.appointments(doctor_id);
create table public.medical_notes(id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patients, doctor_id uuid not null references public.doctors, body text not null check(length(body) between 1 and 2000), is_demo boolean not null default true check(is_demo=true), created_at timestamptz not null default now());
create index medical_notes_patient_idx on public.medical_notes(patient_id);

-- Only this nonexposed helper reads the role while bypassing profile RLS to avoid recursion.
create function private.has_role(wanted public.user_type) returns boolean language sql stable security definer set search_path='' as $$ select exists(select 1 from public.profiles where id=(select auth.uid()) and user_type=wanted) $$;
revoke all on function private.has_role(public.user_type) from public;
grant usage on schema private to authenticated;
grant execute on function private.has_role(public.user_type) to authenticated;

-- Trigger-only provisioning: no role is accepted from editable signup metadata.
create function private.provision_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,email,name,phone) values(new.id,new.email,coalesce(nullif(trim(new.raw_user_meta_data->>'name'),''),'Paciente'),nullif(new.raw_user_meta_data->>'phone',''));
 insert into public.patients(id,user_id,name,email,phone) select id,id,name,email,phone from public.profiles where id=new.id;
 return new;
end $$;
revoke all on function private.provision_user() from public;
create trigger on_auth_user_created after insert on auth.users for each row execute function private.provision_user();
create function private.sync_auth_email() returns trigger language plpgsql security definer set search_path='' as $$ begin update public.profiles set email=new.email,updated_at=now() where id=new.id; update public.patients set email=new.email where id=new.id; update public.doctors set email=new.email where id=new.id; return new; end $$;
revoke all on function private.sync_auth_email() from public;
create trigger on_auth_email_changed after update of email on auth.users for each row execute function private.sync_auth_email();
create function private.sync_patient_profile() returns trigger language plpgsql security definer set search_path='' as $$ begin update public.patients set name=new.name,phone=new.phone,updated_at=now() where id=new.id; update public.doctors set name=new.name,updated_at=now() where id=new.id; return new; end $$;
revoke all on function private.sync_patient_profile() from public;
create trigger on_profile_changed after update of name,phone on public.profiles for each row execute function private.sync_patient_profile();

create function private.guard_appointment() returns trigger language plpgsql set search_path='' as $$
declare d public.doctors; p public.patients;
begin
 if TG_OP='INSERT' then
  if new.status<>'pending' then raise exception 'La cita debe comenzar pendiente'; end if;
  if (new.appointment_date+new.appointment_time) <= (now() at time zone 'America/Lima') then raise exception 'La fecha y hora deben ser futuras'; end if;
  select * into d from public.doctors where id=new.doctor_id and available=true;
  if d.id is null or new.hospital_id<>d.hospital_id or new.specialty_id<>d.specialty_id then raise exception 'El medico no corresponde al centro y especialidad'; end if;
  select * into p from public.patients where id=new.patient_id;
  new.patient_name=p.name; new.email=p.email; new.phone=coalesce(p.phone,'');
 else
  if (to_jsonb(new)-'status'-'updated_at') is distinct from (to_jsonb(old)-'status'-'updated_at') then raise exception 'Solo se puede actualizar el estado de la cita'; end if;
  if old.status not in ('pending','confirmed') then raise exception 'La cita ya esta cerrada'; end if;
  if private.has_role('patient') and new.status<>'cancelled' then raise exception 'El paciente solo puede cancelar citas'; end if;
  if not private.has_role('patient') and not ((old.status='pending' and new.status in ('confirmed','cancelled')) or (old.status='confirmed' and new.status in ('completed','cancelled'))) then raise exception 'Transicion de estado no permitida'; end if;
 end if;
 new.updated_at=now(); return new;
end $$;
revoke all on function private.guard_appointment() from public;
create trigger guard_appointment before insert or update on public.appointments for each row execute function private.guard_appointment();

alter table public.profiles enable row level security;
alter table public.patients enable row level security;
alter table public.doctors enable row level security;
alter table public.specialties enable row level security;
alter table public.hospitals enable row level security;
alter table public.appointments enable row level security;
alter table public.medical_notes enable row level security;
revoke all on all tables in schema public from anon,authenticated;
grant select on public.specialties,public.hospitals,public.doctors,public.patients,public.profiles,public.appointments,public.medical_notes to authenticated;
grant update(name,phone) on public.profiles to authenticated;
grant insert on public.appointments to authenticated;
grant update(status) on public.appointments to authenticated;
create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or private.has_role('admin'));
create policy profiles_edit on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy patients_read on public.patients for select to authenticated using(id=(select auth.uid()) or private.has_role('admin') or exists(select 1 from public.appointments a where a.patient_id=patients.id and a.doctor_id=(select auth.uid())));
create policy doctors_read on public.doctors for select to authenticated using(true);
create policy specialties_read on public.specialties for select to authenticated using(true);
create policy hospitals_read on public.hospitals for select to authenticated using(true);
create policy appointments_read on public.appointments for select to authenticated using(patient_id=(select auth.uid()) or doctor_id=(select auth.uid()) or private.has_role('admin'));
create policy appointments_insert on public.appointments for insert to authenticated with check(patient_id=(select auth.uid()) and private.has_role('patient'));
create policy appointments_edit on public.appointments for update to authenticated using(patient_id=(select auth.uid()) or doctor_id=(select auth.uid()) or private.has_role('admin')) with check(patient_id=(select auth.uid()) or doctor_id=(select auth.uid()) or private.has_role('admin'));
create policy notes_read on public.medical_notes for select to authenticated using(doctor_id=(select auth.uid()) and private.has_role('doctor') and exists(select 1 from public.appointments a where a.patient_id=medical_notes.patient_id and a.doctor_id=(select auth.uid())));
insert into public.specialties(name,description) values('Medicina general','Atencion y seguimiento integral'),('Cardiologia','Cuidado cardiovascular'),('Pediatria','Atencion infantil');
insert into public.hospitals(name,address,phone) values('Centro Medico Miraflores','Av. Larco 123, Lima','01 555 0101'),('Clinica San Borja','Av. San Borja Norte 456, Lima','01 555 0102');

-- Role assignment is authenticated and authorized on the server, never from signup metadata.
create function public.admin_assign_role(target_id uuid, new_role public.user_type, specialty uuid default null, hospital uuid default null) returns void language plpgsql security definer set search_path='' as $$
begin
 if (select auth.uid()) is null or not private.has_role('admin') then raise exception 'Solo administradores' using errcode='42501'; end if;
 if target_id=(select auth.uid()) and new_role<>'admin' then raise exception 'No puedes retirar tu propio rol administrador'; end if;
 if not exists(select 1 from public.profiles where id=target_id) then raise exception 'Cuenta no encontrada'; end if;
 if new_role='doctor' and (specialty is null or hospital is null) then raise exception 'Selecciona especialidad y centro'; end if;
 update public.profiles set user_type=new_role,updated_at=now() where id=target_id;
 if new_role='doctor' then
  insert into public.doctors(id,user_id,name,email,specialty_id,hospital_id) select id,id,name,email,specialty,hospital from public.profiles where id=target_id
  on conflict(id) do update set specialty_id=excluded.specialty_id,hospital_id=excluded.hospital_id,available=true;
 else update public.doctors set available=false where id=target_id;
 end if;
end $$;
revoke all on function public.admin_assign_role(uuid,public.user_type,uuid,uuid) from public,anon;
grant execute on function public.admin_assign_role(uuid,public.user_type,uuid,uuid) to authenticated;
drop policy appointments_read on public.appointments;
create policy appointments_read on public.appointments for select to authenticated using((patient_id=(select auth.uid()) and private.has_role('patient')) or (doctor_id=(select auth.uid()) and private.has_role('doctor')) or private.has_role('admin'));
drop policy appointments_edit on public.appointments;
create policy appointments_edit on public.appointments for update to authenticated using((patient_id=(select auth.uid()) and private.has_role('patient')) or (doctor_id=(select auth.uid()) and private.has_role('doctor')) or private.has_role('admin')) with check((patient_id=(select auth.uid()) and private.has_role('patient')) or (doctor_id=(select auth.uid()) and private.has_role('doctor')) or private.has_role('admin'));
drop policy patients_read on public.patients;
create policy patients_read on public.patients for select to authenticated using((id=(select auth.uid()) and private.has_role('patient')) or private.has_role('admin') or (private.has_role('doctor') and exists(select 1 from public.appointments a where a.patient_id=patients.id and a.doctor_id=(select auth.uid()))));
