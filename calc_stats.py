import sys
import json
from pprint import pprint

def calculate(filename):

    data = json.load(open(filename))

    total_weirdness = 0

    for playlist in data['statistics']:
        weirdness = float(playlist['weirdess'])
        total_weirdness += weirdness

    total_playlists = len(data['statistics'])
    average_weirdness = total_weirdness / total_playlists

    print("Average weirdness:",  average_weirdness)
    print("Playlists generated:", total_playlists)

if __name__ == "__main__":

    if len(sys.argv) > 1:
        filename = sys.argv[1]
        calculate(filename)
    else:
        print("Usage: python calc_stats.py path/to/stats.json")