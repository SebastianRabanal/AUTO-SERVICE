import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

class ConexionBD:
    def __init__(self):
        self.__host = os.getenv("DB_HOST", "localhost")
        self.__user = os.getenv("DB_USER", "root")
        self.__password = os.getenv("DB_PASSWORD", "")
        self.__database = os.getenv("DB_NAME", "kiosko_autoservice")

    def conectar(self):
        try:
            conexion = pymysql.connect(
                host=self.__host,
                user=self.__user,
                password=self.__password,
                database=self.__database
            )
            return conexion
        except Exception as e:
            print(f"Error crítico de conexión: {e}")
            return None
