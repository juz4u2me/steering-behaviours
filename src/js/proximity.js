import VectorOps from './vectorops';
import Collision from './collision';

class Proximity {

    static getMostThreatening = (obstacles) => {
        var position = this.boid.position;
        var mostThreatening = null;        
        for(var i=0; i<obstacles.length; i++) {
            var obstacle = obstacles[i];
            var willIntersect = Collision.willIntersect(this.boid, obstacle);

            if(willIntersect && (mostThreatening == null || VectorOps.distance(position, obstacle) < VectorOps.distance(position, mostThreatening))) {
                mostThreatening = obstacle;
            }
        }

        return mostThreatening;
    }

    static findNeighbours = () => {
        /* Finds the agents that are within the immediate area of the owner. Each of those agents is passed to
         * the reportNeighbor method of the specified callback. 
         */
    }
}

export default Proximity;