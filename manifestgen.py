import glob
import os

manifest = []


def listdir(directory):
    for f in glob.glob(''.join([directory,'/*'])):
        if os.path.isfile(f):
            manifest.append(f)
        else:
            listdir(f)

top = glob.glob('*')
for f in top:
    if os.path.isfile(f):
        manifest.append(f)

    if os.path.isdir(f):
        listdir(f)

f = open('astrospec2.manifest','w')
f.write('CACHE MANIFEST\n\nCACHE:\n')
for line in manifest:
    f.write(line)
    f.write('\n')
f.close()
