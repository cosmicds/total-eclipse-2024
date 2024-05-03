

type PNum = number | number[];
type ONum<T extends PNum> = T extends number ? number : number[];
  
export class SymmetricalLogTransform {
  // adapted from matplotlib
  // https://github.com/matplotlib/matplotlib/blob/main/lib/matplotlib/scale.py#L348
  private base: number;
  private logBase: number;
  

  constructor(base: number = 10) {
    this.base = base;
    this.logBase = Math.log(base);
  }
  
  private log(x: number): number {
    // need this to return exact numbers and 0
    if (x === 0) {
      return 0;
    } 
    if (this.base == 10) {
      return Math.log10(x);
    }
    if (this.base == 2) {
      return Math.log2(x);
    }
    if (this.base == Math.E) {
      return Math.log(x);
    }
    return Math.log(x) / this.logBase;
  }
  
  // generate a sequence of values
  public sequence(max: number, index: boolean = true): number[] {
    const rightSide = (new Array(max + 1)).fill(0).map((_, i) => (i+1));
    const leftSide = rightSide.map((value) => -value).reverse();
    const seq = leftSide.concat([0]).concat(rightSide);
    if (index) {
      return seq;
    } else {
      return this.fromSymLogIndex(seq);
    }
  }
  
  // transform from real numbers to symmetrical log scale
  private inverseTransform<T extends PNum>(value: T): ONum<T> {
    // if value is an array, map over it
    if (Array.isArray(value)) {
      return value.map((v) => this.inverseTransform(v)) as ONum<T>;
    }    
    const absValue = Math.abs(value);
    let out: number;

    if (absValue > 1) {
      out = Math.sign(value) * Math.pow(this.base, absValue) / this.base;
    } else {
      out = value;
    }
    return out as ONum<T>;
  }
  
  private   transform<T extends PNum>(value: T): ONum<T> {
    // if value is an array, map over it
    if (Array.isArray(value)) {
      return value.map((v) => this.transform(v)) as ONum<T>;
    }
    
    const absValue = Math.abs(value);
    let out: number;

    if (absValue > 1) {
      out = Math.sign(value) * (this.log(absValue) + 1);
    } else {
      out = value;
    }
    return out as ONum<T>;
  }
  
  // from -3, -2, -1, 0, 1, 2, 3 --> -100, -10, -1, 0, 1, 10, 100
  public fromSymLogIndex<T extends PNum>(value: T): ONum<T> {
    return this.inverseTransform(value);
  }
  
  public toSymlogIndex<T extends PNum>(value: T): ONum<T> {
    return this.transform(value);
  }

}


export function makeSymmetric(right: number[]): number[] {
  const left = right.map((value) => -value).reverse();
  return left.concat([0]).concat(right);
}

// generate sequence using step size
export function linspace(start: number, stop: number, delta: number): number[] {
  const out = [];
  for (let i = start; i <= stop; i += delta) {
    out.push(i);
  }
  return out;
}

export function symmLinspace(start: number, stop: number, delta: number): number[] {
  const right = linspace(start, stop, delta);
  return makeSymmetric(right);
}