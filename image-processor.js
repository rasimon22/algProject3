function ImageProcessor(){
    var Jimp = require('jimp');
    this.greyscale = function(path){
        let image;
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
}
let ip = new ImageProcessor();
ip.greyscale("mountain.png");