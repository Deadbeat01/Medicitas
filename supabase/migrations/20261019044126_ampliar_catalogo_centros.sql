-- Additional fictional centers for the university demonstration.
insert into public.hospitals(name,address,phone) values
 ('Centro Médico Los Olivos','Av. Universitaria 1200, Los Olivos, Lima','01 555 0103'),
 ('Centro Médico San Miguel','Av. La Marina 1800, San Miguel, Lima','01 555 0104'),
 ('Centro Médico Surco','Av. Benavides 3200, Surco, Lima','01 555 0105'),
 ('Centro Médico La Molina','Av. La Molina 900, La Molina, Lima','01 555 0106')
on conflict(name) do nothing;
