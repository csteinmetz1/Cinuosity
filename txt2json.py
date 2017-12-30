import sys
import os
import json

def convert_txt_to_json(filename):
    output = {} # dictionary to be converted to json

    with open(os.path.join(os.getcwd(),filename), encoding = "ISO-8859-1") as txtfile:
        
        dictionary = txtfile.read().split()
        
        for index, word in enumerate(dictionary):
            
            output[str(index)] = word
        print("added", index+1, "words")
        output["size"] = index+1

    with open(os.path.join(os.getcwd(),filename.replace('txt', 'json')), 'w+') as jsonfile:
        json.dump(output, jsonfile, sort_keys=False, indent=1)


if __name__ == '__main__':

    if len(sys.argv) > 1:
        filename = sys.argv[1]
        convert_txt_to_json(filename)
    else:
        print("Usage: python txt2json filename")