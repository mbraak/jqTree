import os
import re


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
    old_filename = file_tuples[i][1]

    m = re_file.match(old_filename)
  
    file_index = int(m.groups()[0])
    filepart = m.groups()[1]

    expected_index = i + 1

    if file_index != expected_index:
        new_filename = '%02d_%s' % (expected_index, filepart)

        print('rename %s to %s' % (old_filename, new_filename))

        os.rename(old_filename, new_filename)
