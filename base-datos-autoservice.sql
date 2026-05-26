USE kiosko_autoservice;

-- ===== 1. CATALOGOS MAESTROS ====
CREATE TABLE Productos_Base(
	id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    precio_base DECIMAL(10,2) NOT NULL
);

CREATE TABLE Categorias_Modificador(
	id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre_categoria VARCHAR(50) NOT NULL
);

CREATE TABLE Opciones_Modificador(
	id_opcion INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nombre_opcion VARCHAR(50) NOT NULL,
    precio_adicional DECIMAL(10,2) DEFAULT 0.00,
    FOREIGN KEY (id_categoria) REFERENCES Categoria_Modificador(id_categoria)
);

CREATE TABLE Metodo_Pago(
	id_metodo INT AUTO_INCREMENT PRIMARY KEY,
    nombre_metodo VARCHAR(30) NOT NULL
);

-- ==== 2. OPERACIONES Y CLIENTES =====

CREATE TABLE Cliente(
	id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    dni VARCHAR(8) UNIQUE,
    nombre_completo VARCHAR(100) NOT NULL
);

CREATE TABLE Ventas (
	id_venta INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT,
    id_metodo INT NOT NULL,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_pagado DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pagado',
    FOREIGN KEY (id_cliente) REFERENCES Cliente (id_cliente),
    FOREIGN KEY (id_metodo) REFERENCES Metodo_Pago (id_metodo)
);

CREATE TABLE Comprobante_Voucher(
	id_comprobante INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL UNIQUE,
    serie VARCHAR(4) NOT NULL,
    numero_correlativo INT NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES Ventas (id_venta)
);

-- ===== 3. DETALLE MATEMATICO =====

CREATE TABLE Detalle_Ventas (
	id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_venta INT NOT NULL,
    id_producto INT NOT NULL,
    catidad INT DEFAULT 1,
    subtotal_base DECIMAL (10,2) NOT NULL,
    FOREIGN KEY (id_venta) REFERENCES Ventas (id_venta),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE Seleccion_Modificadores(
	id_seleccion INT AUTO_INCREMENT PRIMARY KEY,
    id_detalle INT NOT NULL,
    id_opcion INT NOT NULL,
    cantidad_opcion INT DEFAULT 1,
    FOREIGN KEY (id_detalle) REFERENCES Detalle_Ventas (id_detalle),
    FOREIGN KEY (id_opcion) REFERENCES Opciones_Modificador (id_opcion)
);


-- ==== INSERCION DE DATOS ====

INSERT INTO Productos_Base (nombre, precio_base) VALUES 
	('Hamburguesa Clásica', 15.00),
    ('Pizza Personal', 12.00),
    ('Café Pasado',6.00);
    
INSERT INTO Categorias_Modificador (nombre_categoria) VALUES 
	('Cremas'), 
	('Extras'), 
	('Tipo de Leche');

-- Insertar Opciones de Modificadores (Vinculados a su categoría)
-- Cremas (ID 1) - Costo 0
INSERT INTO Opciones_Modificador (id_categoria, nombre_opcion, precio_adicional) VALUES 
	(1, 'Mayonesa', 0.00),
	(1, 'Kétchup', 0.00),
	(1, 'Ají de la casa', 0.00);
    
-- Extras (ID 2) - Con costo adicional
INSERT INTO Opciones_Modificador (id_categoria, nombre_opcion, precio_adicional) VALUES 
	(2, 'Porción de papas extra', 4.00),
	(2, 'Doble queso', 2.50);

-- Tipo de Leche (ID 3) - Costo 0 o adicional
INSERT INTO Opciones_Modificador (id_categoria, nombre_opcion, precio_adicional) VALUES 
	(3, 'Sin Leche', 0.00),
	(3, 'Leche Entera', 0.00),
	(3, 'Leche de Almendras', 2.00);

INSERT INTO Metodos_Pago (nombre_metodo) VALUES 
	('Yape'), 
	('Plin'), 
	('Efectivo');