from flask import Flask, render_template, jsonify
import random

app = Flask(__name__)

# All available objects with their positions (x, y as percentages)
ALL_OBJECTS = [
    {"name": "angel", "x": 12, "y": 43.2, "radius": 2},
    {"name": "grill", "x": 43.9, "y": 36.6, "radius": 2},
    {"name": "snow man", "x": 6.6, "y": 17.5, "radius": 2},
    {"name": "scooter", "x": 67.4, "y": 48.7, "radius": 3},
    {"name": "penguin", "x": 2.5, "y": 88.9, "radius": 2},
    {"name": "weiner", "x": 63.4, "y": 68.2, "radius": 4},
    {"name": "couple", "x": 95.5, "y": 90.4, "radius": 4},
    {"name": "santa", "x": 40.6, "y": 86.1, "radius": 3},
    {"name": "three kings", "x": 46.5, "y": 25.7, "radius": 3},
    {"name": "balloon salesman", "x": 25.5, "y": 45.6, "radius": 3}
]

current_game = None

@app.route('/')
def index():
    return render_template('day2_index.html')

@app.route('/new_game')
def new_game():
    global current_game
    # Select 5 random objects
    current_game = random.sample(ALL_OBJECTS, 5)
    # Return only names to the client
    return jsonify({
        'objects': [obj['name'] for obj in current_game]
    })

@app.route('/check_click/<int:x>/<int:y>')
def check_click(x, y):
    global current_game
    if not current_game:
        return jsonify({'found': False})
    
    for obj in current_game:
        # Calculate distance from click to object center
        distance = ((x - obj['x'])**2 + (y - obj['y'])**2)**0.5
        if distance <= obj['radius']:
            return jsonify({
                'found': True,
                'object': obj['name'],
                'x': obj['x'],
                'y': obj['y'],
                'radius': obj['radius']
            })
    
    return jsonify({'found': False})

if __name__ == '__main__':
    app.run(debug=True)