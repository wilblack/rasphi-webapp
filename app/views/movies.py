from images2gif import writeGif
from PIL import Image
import os



def download():
    base_url = "http://ardyh.solalla.com/growbot/"

    res = requests.get(base_url)
    import pdb; pdb.set_trace()


def create_animation():
    images_dir = "./raw/"
    size = [640, 480]
    out_name = "animation.gif"

    file_names = sorted((fn for fn in os.listdir(images_dir) if fn.endswith('.jpg')))
    #['animationframa.png', 'animationframb.png', ...] "

    images = [Image.open(fn) for fn in file_names]

    for im in images:
        im.thumbnail(size, Image.ANTIALIAS)

    print writeGif.__doc__

    writeGif(out_name, images, duration=0.2)