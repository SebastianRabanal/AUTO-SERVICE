from flask import Flask, request, jsonify
from flask_cors import CORS
from clases import Venta

app = Flask(__name__)
CORS(app)

@app.route('/modificadores/<int:id_prod>', methods=['GET'])
def obtener_modificadores(id_prod):
    return jsonify({
        "Cremas y Extras": [
            {"nombre": "Mayonesa", "precio": 0.00},
            {"nombre": "Kétchup", "precio": 0.00},
            {"nombre": "Papas extra", "precio": 4.00},
            {"nombre": "Doble queso", "precio": 2.50}
        ]
    })


@app.route('/comprar', methods=['POST'])
def registrar_compra():
    datos = request.json

    mapa_pagos = {'yape': 1, 'plin': 2, 'efectivo': 3}
    metodo_str = datos.get('metodo_pago', 'efectivo')
    id_metodo = mapa_pagos.get(metodo_str, 3)
    nueva_venta = Venta(id_metodo=id_metodo, total_pagado=datos['total'])
    nueva_venta.guardar()
    
    return jsonify({
        "mensaje": "Venta exitosa",
        "id_venta": "001",
        "total": datos['total']
    })

if __name__ == '__main__':
    app.run(port=8000, debug=True)
