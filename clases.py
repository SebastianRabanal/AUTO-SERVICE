from abc import ABC, abstractmethod
from conexion import ConexionBD

class EntidadBase(ABC):
    @abstractmethod
    def guardar(self):
        pass

class Venta(EntidadBase):
    def __init__(self, id_metodo, total_pagado):
        self.__id_metodo = id_metodo
        self.__total_pagado = total_pagado

    @property
    def id_metodo(self):
        return self.__id_metodo

    @id_metodo.setter
    def id_metodo(self, valor):
        self.__id_metodo = valor

    @property
    def total_pagado(self):
        return self.__total_pagado

    @total_pagado.setter
    def total_pagado(self, valor):
        self.__total_pagado = valor

    def guardar(self):
        conexion = ConexionBD().conectar()
        if conexion:
            cursor = conexion.cursor()
            sql = "INSERT INTO Ventas (id_metodo, total_pagado, estado) VALUES (%s, %s, 'Pagado')"
            cursor.execute(sql, (self.__id_metodo, self.__total_pagado))
            conexion.commit()
            conexion.close()
