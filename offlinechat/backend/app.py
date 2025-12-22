from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/api/message', methods=['POST'])
def message():
    data = request.get_json()
    user_message = data.get('message', '')
    # For now, just echo the message back
    return jsonify({'reply': f'You said: {user_message}'})

if __name__ == '__main__':
    app.run(debug=True)