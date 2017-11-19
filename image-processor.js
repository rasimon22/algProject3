function ImageProcessor(){
    var Jimp = require('jimp');
    /*****************************
     * Image processor iteratively applies a luminance 
     * greyscale filter and writes the new image
     */
    this.greyscale = function(path){
        Jimp.read(path).then(function(image){
            image.scan(0,0, image.bitmap.width, image.bitmap.height, function(x, y, idx){
                let color = Jimp.intToRGBA(image.getPixelColor(x,y));
                let scale = (color.r*.3 + color.g*.59 + color.b*.11);
                image.setPixelColor(Jimp.rgbaToInt(scale, scale, scale, color.a),x,y);
            });
            image.write("greyscale.png",function(){
                console.log("image written");
            })
        }).catch(function(err){
            console.error(err);
        });
    }
    /**
     * Uses consecutive one directional moving averages to apply a blur
     * this runs faster than 2 directions at once; T(2n) vs T(n^2)
     * 
     */
    this.blur = function(path, blur){
        Jimp.read(path).then(function(image){
            image.scan(0,0, image.bitmap.width, image.bitmap.height, function(x, y, idx){
                if(x>blur && x<image.bitmap.width-blur && y>blur && y<image.bitmap.height-blur){
                
                    let c1 = Jimp.intToRGBA(image.getPixelColor(x-blur,y));
                    let c2 = Jimp.intToRGBA(image.getPixelColor(x+blur,y));
                    c1.r = (c1.r+c2.r)/2;
                    c1.g = (c1.g+c2.g)/2;
                    c1.b = (c1.b+c2.b)/2;
                    c1.a = (c1.a+c2.a)/2;
                    image.setPixelColor(Jimp.rgbaToInt(c1.r,c1.g,c1.b,c1.a), x, y); 
                    c1 = Jimp.intToRGBA(image.getPixelColor(x,y-blur));
                    c2 = Jimp.intToRGBA(image.getPixelColor(x,y+blur));
                    c1.r = (c1.r+c2.r)/2;
                    c1.g = (c1.g+c2.g)/2;
                    c1.b = (c1.b+c2.b)/2;
                    c1.a = (c1.a+c2.a)/2;
                    image.setPixelColor(Jimp.rgbaToInt(c1.r,c1.g,c1.b,c1.a), x, y);  
                }
            });
        image.write("box_blur.png",function(){
            console.log("image written");
        });
        }).catch(function(err){
            console.error(err);
            });
    }
}

let ip = new ImageProcessor();
ip.blur("mountain.png",10);