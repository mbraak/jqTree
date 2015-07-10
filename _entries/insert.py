import os
import argparse
import re


parser = argparse.ArgumentParser()
parser.add_argument('index', type=int)

args = parser.parse_args()

insert_index = args.index

filenames = os.listdir('.')

file_tuples = []

re_file = re.compile(r'^(\d\d)_(.*)$')

for filename in filenames:
    m = re_file.match(filename)

    if m:
        i = int(m.groups()[0])

        t = i, filename

        file_tuples.append(t)

file_tuples = sorted(file_tuples, key=lambda t: t[0])

for i, t in enumerate(file_tuples):
    if i + 1 != t[0]:
        raise Exception('Expected index %s for %s' % (i, t[1]))

for i in range(insert_index - 1, len(file_tuples)):
    old_filename = file_tuples[i][1]

    m = re_file.match(old_filename)

    filepart = m.groups()[1]

    new_filename = '%02d_%s' % (i + 2, filepart)

    print 'rename %s to %s' % (old_filename, new_filename)

    os.rename(old_filename, new_filename)
