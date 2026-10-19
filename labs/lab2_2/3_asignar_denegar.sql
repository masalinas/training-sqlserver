USE Ventas; -- <--- Asegúrate de usar el nombre correcto de tu Base de Datos
GO

/* =========================================================================
   PASO 1: Asegurar los miembros en los roles (Asignar)
   ========================================================================= */

-- Asignar el usuario de la aplicación como miembro del rol_operador
ALTER ROLE rol_operador ADD MEMBER UserApp;

-- Asignar el usuario de reportes como miembro del rol_lectura_rpt
ALTER ROLE rol_lectura_rpt ADD MEMBER UserRpt;
GO


/* =========================================================================
   PASO 2: Restricción explícita de seguridad (Denegar)
   Propósito: Bloquear explícitamente las consultas SELECT directas 
              sobre dbo.Pedido para todos los miembros de 'rol_operador'.
   ========================================================================= */

DENY SELECT ON dbo.Pedido TO rol_operador;
GO

PRINT '¡Miembros asignados y restricción DENY SELECT aplicada correctamente sobre dbo.Pedido!';
GO
