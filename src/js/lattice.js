import VectorOps from './vectorops';

class Lattice {

    static init_bin = () => {
        let canvas = document.getElementById('nav-area');
        var bin_lattice = [[],[]];
        for(let j = 0; j < canvas.width/100; j++) {
            bin_lattice[j] = [];
            for(let k = 0; k < canvas.height/100; k++) {
                bin_lattice[j][k] = [];
            }
        }

        return bin_lattice;
    }

    static update_bin = (bin, pt, b) => {
        var dimenx = Math.floor(VectorOps.getX(pt)/100);
        var dimeny = Math.floor(VectorOps.getY(pt)/100);
        bin[dimenx][dimeny].push(b);
    }

    // TODO: cannot remove the element this way as it is an array inside the 2d array, if we cannot remove can we repopulate the whole bin?
    static remove = (bin, pt) => {
        var col = Math.floor(VectorOps.getX(pt)/100);
        var row = Math.floor(VectorOps.getY(pt)/100);
        bin[row].splice(col, 1);
        console.log(row, col);
    }
}

export default Lattice;