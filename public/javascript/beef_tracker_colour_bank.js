var purple_colour_bank = ["#A11D5D","#83188A","#6915A1","#3D218A","#1D26A1"];
var red_colour_bank = ["#9C0505","#DE0000","#D47777","#F79C9C","#FF0000","#800000","#4d0000","#e05757"];
var colour_index = -1;

//return a colour based on how many times this function 
function getNextColor(){
    colour_index++;
    if(colour_index == red_colour_bank.length){
        colour_index = 0;
    }
    return red_colour_bank[colour_index];
}