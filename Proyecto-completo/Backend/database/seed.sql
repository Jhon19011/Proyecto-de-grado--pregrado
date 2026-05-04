-- SEDES
INSERT INTO sede (nombre_sede) VALUES
('Sede Principal Bogotá D.C.'),
('Sede Bucaramanga'),
('Sede Villaviencio'),
('Sede Medellín');

-- ROLES
INSERT INTO rol (nombre_rol) VALUES
('Administrador'),
('Laboratorista');

-- USUARIO ADMIN
INSERT INTO usuario (
nombres,
apellidos,
correo,
telefono,
password,
rol,
sedeU
) VALUES (
'Admin',
'Sistema',
'admin@admin.com',
'0000000000',
'HASH_GENERADO',
1,
1
);