import { MovieCount } from './models';

export class TopMovieHeap {
    heap: MovieCount[] = [];

    push(movie: MovieCount) {
        this.heap.push(movie);
        this.heapUp();
    }

    private heapUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].users.length >= this.heap[index].users.length)
                break;

            this.swap(parentIndex, index);
            index = parentIndex
        }
    }

    pop(): MovieCount | null {
        if (this.heap.length === 0)
            return null;

        const top = this.heap[0];
        const last = this.heap.pop();
        if (this.heap.length > 0 && last !== undefined) {
            this.heap[0] = last;
            this.heapDown();
        }

        return top;
    }

    private heapDown() {
        let index = 0;
        while (index < this.heap.length) {
            const leftChild = 2 * index + 1;
            const rightChild = 2 * index + 2;
            let largest = index;

            if (leftChild < this.heap.length &&
                this.heap[leftChild].users.length > this.heap[largest].users.length) {
                largest = leftChild;
            }

            if (rightChild < this.heap.length &&
                this.heap[rightChild].users.length > this.heap[largest].users.length) {
                largest = rightChild;
            }

            if (largest === index)
                break;

            this.swap(index, largest);
            index = largest;
        }
    }

    private swap(left: number, right: number): void {
        [this.heap[left], this.heap[right]] = [this.heap[right], this.heap[left]];
    }
}