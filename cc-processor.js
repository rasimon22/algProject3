const Jimp = require('jimp');
function Label(x, y, r, g, b, a, group){
    this.x = x;
    this.y = y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
    this.group = group;

}
function CC_Processor(){
    this.fgbg= async function(path){
        const image = await Jimp.read(path);
        image.scan(0,0,image.bitmap.width,image.bitmap.height,function(x,y,idx){
            let r = image.bitmap.data[idx];
            let g = image.bitmap.data[idx+1];
            let b = image.bitmap.data[idx+2];
            let black = Jimp.rgbaToInt(0,0,0,255);
            let white = Jimp.rgbaToInt(255,255,255,255);
            if(r+g+b/3 > 80){
                image.setPixelColor(white,x,y);
            }
            else{
                image.setPixelColor(black,x,y);
            }
        });
        image.write("fgbg.png");
    }
//======================================================
    this.labelPixels = async function(path){
        labels = [];
        currentLabel = 0;
        const image = await Jimp.read(path);
        let black = Jimp.rgbaToInt(0,0,0,255);
        let white = Jimp.rgbaToInt(255,255,255,255);
        let red = Jimp.rgbaToInt(255,0,0,255);
        for(let i = 0; i < (image.bitmap.height*image.bitmap.width);i++){
            labels.push(0);
        }
        let westPixelColor =  function(x,y){
            index =  image.getPixelIndex(x-1,y);
            let color =  Jimp.rgbaToInt(image.bitmap.data[index],image.bitmap.data[index+1],image.bitmap.data[index+2],255);
            return color;
        }
        let northPixelColor =  function(x,y){
            index =  image.getPixelIndex(x,y-1);
            return Jimp.rgbaToInt(image.bitmap.data[index],image.bitmap.data[index+1],image.bitmap.data[index+2],255);
        }
        await image.scan(1,1,image.bitmap.width,image.bitmap.height,function(x,y,idx){
            let westSame = westPixelColor(x,y) == image.getPixelColor(x,y);
            let northSame = northPixelColor(x,y) == image.getPixelColor(x,y);
            let northWestSameLabel = labels[image.getPixelIndex(x-1,y)] == labels[image.getPixelIndex(x,y-1)];
           if(image.getPixelColor(x,y) == white){
            if(westSame){
                labels[image.getPixelIndex(x,y)]=labels[image.getPixelIndex(x-1,y)];
            }
            else{
                if(westSame && northSame &&!northWestSameLabel){
                    labels[image.getPixelIndex(x-1,y)]>labels[image.getPixelIndex(x,y-1)]?
                    labels[image.getPixelIndex(x,y)] = labels[image.getPixelIndex(x-1,y)]:
                    labels[image.getPixelIndex(x,y)] = labels[image.getPixelIndex(x,y-1)];
                }
                else{
                    if(!westSame && northSame){
                        labels[image.getPixelIndex(x,y)]=labels[image.getPixelIndex(x,y-1)];
                    }
                    else{
                        if(!westSame && !northSame){
                            labels[image.getPixelIndex(x,y)] = currentLabel++;
                        }
                    }
                }
            }
       }

        });
        console.log(labels);
        return labels;
    }
    this.paintPixels = async function(path, labels){
        const image = await Jimp.read(path);
        let labelList = await labels;
        let black = Jimp.rgbaToInt(0,0,0,255);
        let white = Jimp.rgbaToInt(255,255,255,255);
        let red = Jimp.rgbaToInt(255,0,0,255);
        let green = Jimp.rgbaToInt(0,255,0,255);
        await image.scan(0,0,image.bitmap.width,image.bitmap.height,function(x,y,idx){
            label = labelList[idx];
            // switch(label){
            //     case 0:
            //     image.setPixelColor(black,x,y);
            //     break;
            //     case 1:
            //     image.setPixelColor(red,x,y);
            //     break;
            //     case 2:
            //     image.setPixelColor(white,x,y);
            //     break;
            //     case 3:
            //     image.setPixelColor(green,x,y);
            //     break;
            // }
            color=Jimp.rgbaToInt(Math.pow(label,3)%255,Math.pow(label,2)%255,Math.pow(label,4)%255,255);
            image.setPixelColor(color,x,y);
        });
        image.write("painted.png");
    }
}
module.exports.CC_Processor = CC_Processor;