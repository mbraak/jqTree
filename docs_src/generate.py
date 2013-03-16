import os
import re

from jinja2 import Environment, FileSystemLoader


env = Environment(loader=FileSystemLoader('.'))


def generate(source_filename, target_filename):
    print 'generate %s' % source_filename
    template = env.get_template(source_filename)

    html = template.render()

    with open(target_filename, 'w') as f:
        f.write(html)


def get_template_files():
    def get_filename(f):
        return os.path.splitext(f)[0]

    return [
        get_filename(f) for f in os.listdir('.')
        if f.endswith('.tmpl')
    ]


for f in get_template_files():
    source_filename = '%s.tmpl' % f
    target_filename = '../examples/%s.html' % f
    generate(source_filename, target_filename)
