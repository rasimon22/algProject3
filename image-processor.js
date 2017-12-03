function Kernel(h, w){
}
function ImageProcessor(){
    var Jimp = require('jimp');
    /*****************************
     * Image processor iteratively applies a luminance 
     * greyscale filter and writes the new image
     */
    this.greyscale = async function(path){
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
    this.box_blur = async function(path, blur){
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
    this.sharpen = async function(bl, or){
       const original = await Jimp.read(or);
       const blurred = await Jimp.read(bl);
       await this.box_blur(or,1);
       const or_bitmap = original.bitmap.data;
       const bl_bitmap = blurred.bitmap.data;
    //    for(let i = 0; i < or_bitmap.length;i++){
    //     console.log(or_bitmap[i]-bl_bitmap[i]);
    //    }
       let calc_color = function(idx){
           //original colors
           let or_r = or_bitmap[idx+0];
           let or_g = or_bitmap[idx+1];
           let or_b = or_bitmap[idx+2];
           let or_a = or_bitmap[idx+3];
           //blurred colors
           let bl_r = bl_bitmap[idx+0];
           let bl_g = bl_bitmap[idx+1];
           let bl_b = bl_bitmap[idx+2];
           let bl_a = bl_bitmap[idx+3];
           //original pixel int
           return Jimp.rgbaToInt(Math.abs(or_r-bl_r),Math.abs(or_g-bl_g),Math.abs(or_b-bl_b),255);
           

       }
       let mask = new Jimp(1920,700, function(err,image){
        image.scan(0,0,image.bitmap.width,image.bitmap.height,function(x,y,idx){
            image.setPixelColor(calc_color(idx),x,y);
        });
        image.write("mask.png",function(){
            console.log("image written");
        })
       });
       let mask_btmp = mask.bitmap.data;
       original.scan(0,0,original.bitmap.width,original.bitmap.height,function(x,y,idx){
           or_r = or_bitmap[idx+0];
           or_g = or_bitmap[idx+1];
           or_b = or_bitmap[idx+2];

           let msk_r = mask_btmp[idx+0];
           let msk_g = mask_btmp[idx+1];
           let msk_b = mask_btmp [idx+2];
           let valBetween = function(v, min, max) {
            return (Math.min(max, Math.max(min, v)));
           }
           let color = Jimp.rgbaToInt(valBetween(or_r+msk_r,0,255),valBetween(or_g+msk_g,0,255),valBetween(or_b+msk_b,0,255),255);
           original.setPixelColor(color, x, y);
       });
       original.write("sharp.png");
    }
}

let ip = new ImageProcessor();
//ip.box_blur("mountain.png",5);
const CC_Processor = require("./cc-processor");
//ip.sharpen("box_blur.png","mountain.png");
let cc = new CC_Processor.CC_Processor();
//ip.greyscale("mountain.png");
// ip.box_blur("pic.png");
//  ip.sharpen("box_blur.png","pic.png");
// // // ip.greyscale("sharp.png");
//   cc.fgbg("sharp.png");
 cc.paintPixels("fgbg.png",cc.labelPixels("fgbg.png"));
