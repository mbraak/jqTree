import os
import re


filenames = os.listdir('./_entries')
re_file = re.compile(r'^(\d\d)_(.*)$')
file_tuples = []

for filename in filenames:
    m = re_file.match(filename)

    if m:
      entry_index = int(m.groups()[0])
      name = m.groups()[1]
      file_tuples.append(
        (entry_index, name)
      )

      os.rename(f"./_entries/{filename}", f"./_entries/{name}")

sorted_tuples = sorted(
  file_tuples,
  key=lambda t: t[0]
)
sorted_names = [t[1] for t in sorted_tuples]

#for name in sorted_names:
#  print(f"- {name}")
