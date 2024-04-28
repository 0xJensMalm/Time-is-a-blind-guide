const config = {
  gridSizeFactor: 5, // Scale factor for grid size
  gridRatio: { rows: 8, cols: 6 }, // Aspect ratio for grid
  padding: { top: 100, left: 20, right: 20, bottom: 20 },
  clockScaleFactor: 0.95,
  dialStrokeScale: 0.15,
  noiseScale: 0.03, // f.eks 0.01 -> 0.1
  noiseOffset1: 1000, //undersøk
  noiseOffset2: 3000, //undersøk
  animationSpeed: 0.01,
  currentRule: "rectangle",
  themes: {
    cleanRetro: {
      bg: "#ffbb6c",
      clockface: "#ffffff",
      bDial: "#000000",
      sDial: "#000000",
    },
    golidTricolor: {
      bg: "#1f1e43",
      clockface: "#f8cb57",
      bDial: "#57b7ab",
      sDial: "#ec653b",
    },
    ducciA: {
      bg: "#ebdec5",
      clockface: "#d39a0e",
      bDial: "#000000",
      sDial: "#000000",
    },
    cc232: {
      bg: "#ff7044",
      clockface: "#5d5f46",
      bDial: "#ffce3a",
      sDial: "#66aeaa",
    },
  },
  currentTheme: "ducciA",
};

class Clock {
  constructor(x, y, diameter) {
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.dial1 = random(TWO_PI);
    this.dial2 = random(TWO_PI);
    this.longDialLength = this.diameter * 0.45;
    this.shortDialLength = this.diameter * 0.35;
    this.targetDial1 = this.dial1;
    this.targetDial2 = this.dial2;
  }
  animateToTarget() {
    const stepSize = PI / 180; // This controls the speed of the animation, adjust as needed

    // Move dial1 towards targetDial1
    if (abs(this.targetDial1 - this.dial1) > stepSize) {
      this.dial1 += stepSize * Math.sign(this.targetDial1 - this.dial1);
    } else {
      this.dial1 = this.targetDial1; // Snap to the target if within one step size
    }

    // Move dial2 towards targetDial2
    if (abs(this.targetDial2 - this.dial2) > stepSize) {
      this.dial2 += stepSize * Math.sign(this.targetDial2 - this.dial2);
    } else {
      this.dial2 = this.targetDial2; // Snap to the target if within one step size
    }
  }

  display() {
    const theme = config.themes[config.currentTheme];
    console.log("Current Theme: ", config.currentTheme); // Debug current theme
    console.log("Big Dial Color: ", theme.bDial); // Debug color value
    console.log("Small Dial Color: ", theme.sDial); // Debug color value

    const strokeScale = this.diameter * config.dialStrokeScale; // Calculate stroke based on clock diameter
    push();
    stroke(theme.bDial);
    fill(theme.clockface);
    ellipse(this.x, this.y, this.diameter);
    strokeWeight(strokeScale); // Use scaled stroke width
    line(
      this.x,
      this.y,
      this.x + cos(this.dial1) * this.longDialLength,
      this.y + sin(this.dial1) * this.longDialLength
    );
    stroke(theme.sDial); // Ensure this stroke setting takes effect for small dial
    line(
      this.x,
      this.y,
      this.x + cos(this.dial2) * this.shortDialLength,
      this.y + sin(this.dial2) * this.shortDialLength
    );
    pop();
  }
}

class Grid {
  constructor(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.clocks = this.createGrid();
  }

  createGrid() {
    let clocks = [];
    for (let i = 0; i < this.rows; i++) {
      clocks[i] = [];
      for (let j = 0; j < this.cols; j++) {
        let x =
          config.padding.left +
          (j * (width - config.padding.left - config.padding.right)) /
            this.cols +
          (width - config.padding.left - config.padding.right) / this.cols / 2;
        let y =
          config.padding.top +
          (i * (height - config.padding.top - config.padding.bottom)) /
            this.rows +
          (height - config.padding.top - config.padding.bottom) / this.rows / 2;
        let diameter =
          min(
            (width - config.padding.left - config.padding.right) / this.cols,
            (height - config.padding.top - config.padding.bottom) / this.rows
          ) * config.clockScaleFactor;
        clocks[i][j] = new Clock(x, y, diameter);
      }
    }
    return clocks;
  }
  applyAlignmentRules() {
    if (config.currentRule === "noise") {
      this.applyNoiseBasedAlignment();
    } else if (config.currentRule === "quarter") {
      this.applyQuarterAlignment();
    } else if (config.currentRule === "rectangle") {
      this.applyRectanglePattern();
    }
  }

  applyNoiseBasedAlignment() {
    let baseNoiseX = config.noiseOffset1;
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let current = this.clocks[i][j];
        let baseAngle =
          noise(
            baseNoiseX + j * config.noiseScale,
            baseNoiseX + i * config.noiseScale
          ) * TWO_PI;
        current.targetDial1 = baseAngle;
        current.targetDial2 = (baseAngle + PI) % TWO_PI;
      }
    }
  }

  applyQuarterAlignment() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let current = this.clocks[i][j];
        let baseAngle = floor(random(4)) * HALF_PI; // Randomly choose 0, 90, 180, 270 degrees
        current.targetDial1 = baseAngle;
        current.targetDial2 = (baseAngle + HALF_PI) % TWO_PI; // 90 degrees apart
      }
    }
  }

  applyRectanglePattern() {
    const layerCount = Math.min(this.rows, this.cols) / 2; // Determine the number of layers based on the smallest grid dimension

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let minDistToEdge = Math.min(
          i,
          j,
          this.rows - 1 - i,
          this.cols - 1 - j
        );
        let layer = Math.floor(minDistToEdge / 2); // Determine which layer the current clock is in
        let isEdge =
          i === 0 || i === this.rows - 1 || j === 0 || j === this.cols - 1;
        let isCorner =
          (i === 0 || i === this.rows - 1) && (j === 0 || j === this.cols - 1);
        let current = this.clocks[i][j];

        if (isCorner) {
          if (i === 0 && j === 0) {
            // Top-Left Corner
            current.targetDial1 = 0;
            current.targetDial2 = Math.PI / 2;
          } else if (i === 0 && j === this.cols - 1) {
            // Top-Right Corner
            current.targetDial1 = Math.PI;
            current.targetDial2 = Math.PI / 2;
          } else if (i === this.rows - 1 && j === 0) {
            // Bottom-Left Corner
            current.targetDial1 = 0;
            current.targetDial2 = 1.5 * Math.PI;
          } else if (i === this.rows - 1 && j === this.cols - 1) {
            // Bottom-Right Corner
            current.targetDial1 = Math.PI;
            current.targetDial2 = 1.5 * Math.PI;
          }
        } else if (isEdge) {
          if (i === 0 || i === this.rows - 1) {
            // Top or bottom row
            current.targetDial1 = 0; // Horizontal
            current.targetDial2 = Math.PI;
          } else {
            // Left or right column
            current.targetDial1 = Math.PI / 2; // Vertical
            current.targetDial2 = 1.5 * Math.PI;
          }
        } else {
          // Internal clocks mimic the nearest edge's orientation
          let nearestEdgeVertical = j <= this.cols / 2 ? 0 : this.cols - 1;
          let nearestEdgeHorizontal = i <= this.rows / 2 ? 0 : this.rows - 1;

          if (
            Math.abs(j - nearestEdgeVertical) <
            Math.abs(i - nearestEdgeHorizontal)
          ) {
            current.targetDial1 = Math.PI / 2;
            current.targetDial2 = 1.5 * Math.PI;
          } else {
            current.targetDial1 = 0;
            current.targetDial2 = Math.PI;
          }
        }
      }
    }
  }

  display() {
    this.clocks.forEach((row) => row.forEach((clock) => clock.display()));
  }
}

let grid;
let customFont;

function preload() {
  customFont = loadFont("font.ttf"); // Load the custom font
}

function setup() {
  createCanvas(600, 800); // Set canvas size
  grid = new Grid(
    config.gridRatio.rows * config.gridSizeFactor,
    config.gridRatio.cols * config.gridSizeFactor
  );
  grid.applyAlignmentRules();
  textFont(customFont); // Set the loaded font as the default font
}

function draw() {
  background(config.themes[config.currentTheme].bg);
  fill(0); // Set text color
  textSize(32); // Set text size
  textAlign(CENTER, CENTER);
  text("Time is a blind guide", width / 2, config.padding.top / 2); //

  grid.display();
  grid.clocks.forEach((row) => row.forEach((clock) => clock.animateToTarget()));
  config.noiseOffset1 += 0.01; // Increment to animate the noise effect dynamically
}
