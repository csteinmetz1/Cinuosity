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

def split_txt_to_json(filename):
    short_words = {} # dictionary to be converted to json
    medium_words = {}
    long_words = {}
    num_short_words = 0
    num_medium_words = 0
    num_long_words = 0

    with open(os.path.join(os.getcwd(),filename)) as txtfile:
        
        dictionary = txtfile.read().split('\n')
        print(len(dictionary))

        for index, word in enumerate(dictionary):
            if len(word) > 10 and len(word) < 20:
                long_words[str(num_long_words)] = word
                num_long_words += 1
            elif len(word) > 5:
                medium_words[str(num_long_words)] = word
                num_medium_words += 1
            else:
                short_words[str(num_short_words)] = word
                num_short_words += 1

        print("added", num_long_words + num_medium_words + num_short_words, "words")
        print("added", num_long_words, "long words")
        long_words['size'] = num_long_words
        print("added", num_medium_words, "medium words")
        medium_words['size'] = num_medium_words
        print("added", num_short_words, "short words")
        short_words['size'] = num_short_words

        short_filename = 'short_' + filename.replace('txt', 'json')
        medium_filename = 'medium_' + filename.replace('txt', 'json')
        long_filename = 'long_' + filename.replace('txt', 'json')

    with open(os.path.join(os.getcwd(),long_filename), 'w+') as jsonfile:
        json.dump(long_words, jsonfile, sort_keys=False, indent=1)

    with open(os.path.join(os.getcwd(), medium_filename), 'w+') as jsonfile:
        json.dump(medium_words, jsonfile, sort_keys=False, indent=1)
    
    with open(os.path.join(os.getcwd(), short_filename), 'w+') as jsonfile:
        json.dump(short_words, jsonfile, sort_keys=False, indent=1)


if __name__ == '__main__':

    if len(sys.argv) == 3:
        filename = sys.argv[1]
        if sys.argv[2] == '--split':
            split_txt_to_json(filename)
        else:
            print("Usage: python txt2json filename (--split)")
    elif len(sys.argv) == 2:
        filename = sys.argv[1]
        convert_txt_to_json(filename)
    else:
        print("Usage: python txt2json filename (--split)")