CREATE DATABASE Ventas
ON PRIMARY
    (NAME = Ventas_sys, FILENAME = '/var/opt/mssql/data/Ventas.mdf', SIZE = 64MB, FILEGROWTH = 64MB),
FILEGROUP FG_DATOS
    (NAME = Ventas_d1, FILENAME = '/var/opt/mssql/data/Ventas_d1.ndf', SIZE = 256MB, FILEGROWTH = 128MB),
    (NAME = Ventas_d2, FILENAME = '/var/opt/mssql/data/Ventas_d2.ndf', SIZE = 256MB, FILEGROWTH = 128MB)
LOG ON
    (NAME = Ventas_log, FILENAME = '/var/opt/mssql/log/Ventas.ldf', SIZE = 128MB, FILEGROWTH = 64MB);
GO