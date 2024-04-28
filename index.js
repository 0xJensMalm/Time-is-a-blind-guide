const config = {
  gridSizeFactor: 3, // Scale factor for grid size
  gridRatio: { rows: 8, cols: 6 }, // Aspect ratio for grid
  padding: { top: 100, left: 20, right: 20, bottom: 20 },
  clockScaleFactor: 0.95,
  dialStrokeScale: 0.1,
  noiseScale: 0.03, // f.eks 0.01 -> 0.1
  noiseOffset1: 1000,
  animationSpeed: 0.01, //funker ikke
  frameThickness: 10,
  currentRule: "rectangle", //gradient //rectangle //noise //quarter
  themes: {
    cleanRetro: {
      bg: "#ffbb6c",
      clockface: "#ffffff",
      bDial: "#000000",
      sDial: "#000000",
      titleColor: "#333333",
      frameColor: "#222222", // Dark frame for a vintage look
    },
    golidTricolor: {
      bg: "#1f1e43",
      clockface: "#f8cb57",
      bDial: "#57b7ab",
      sDial: "#ec653b",
      titleColor: "#f8cb57",
      frameColor: "#ffffff", // White frame to contrast dark background
    },
    ducciA: {
      bg: "#ebdec5",
      clockface: "#d39a0e",
      bDial: "#000000",
      sDial: "#000000",
      titleColor: "#d39a0e",
      frameColor: "#8a7f8d", // Complementary frame color
    },
    cc232: {
      bg: "#ff7044",
      clockface: "#5d5f46",
      bDial: "#ffce3a",
      sDial: "#66aeaa",
      titleColor: "#ffffff",
      frameColor: "#000000", // Black frame for strong contrast
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
    this.isContinuous = false;
  }
  animateToTarget() {
    if (this.isContinuous) {
      this.dial1 += this.continuousSpeed1; // Long dial speed
      this.dial2 += this.continuousSpeed2; // Short dial speed
    } else {
      const stepSize = PI / 180;
      if (abs(this.targetDial1 - this.dial1) > stepSize) {
        this.dial1 += stepSize * Math.sign(this.targetDial1 - this.dial1);
      } else {
        this.dial1 = this.targetDial1;
      }
      if (abs(this.targetDial2 - this.dial2) > stepSize) {
        this.dial2 += stepSize * Math.sign(this.targetDial2 - this.dial2);
      } else {
        this.dial2 = this.targetDial2;
      }
    }
  }

  display() {
    const theme = config.themes[config.currentTheme];
    const strokeScale = this.diameter * config.dialStrokeScale;

    push();
    const speedColor = lerpColor(
      color(theme.sDial),
      color(theme.bDial),
      this.continuousSpeed1 / 0.05
    );
    stroke(speedColor);
    fill(theme.clockface);
    ellipse(this.x, this.y, this.diameter);
    strokeWeight(strokeScale);

    line(
      this.x,
      this.y,
      this.x + cos(this.dial1) * this.longDialLength,
      this.y + sin(this.dial1) * this.longDialLength
    );
    stroke(theme.sDial); // Default color or change based on conditions
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
    } else if (config.currentRule === "circle") {
      this.applyCirclePattern();
    } else if (config.currentRule === "gradient") {
      this.applyGradientContinuousMovement();
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

  applyCirclePattern() {
    const centerX = this.cols / 2;
    const centerY = this.rows / 2;

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let dx = j - centerX;
        let dy = i - centerY;
        let angle = Math.atan2(dy, dx) + Math.PI; // Point towards the center
        let current = this.clocks[i][j];
        current.targetDial1 = angle;
        current.targetDial2 = angle + Math.PI / 2;
        current.isContinuous = false; // Ensure this is reset for proper behavior
      }
    }
  }

  applyGradientContinuousMovement() {
    const centerX = this.cols / 2;
    const centerY = this.rows / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        let dx = j - centerX;
        let dy = i - centerY;
        let distance = Math.sqrt(dx * dx + dy * dy);
        let baseSpeed = map(distance, 0, maxDistance, 0.05, 0.01); // Speed base on distance from center

        let current = this.clocks[i][j];
        current.continuousSpeed1 = baseSpeed * 2; // Long dial moves at twice the base speed
        current.continuousSpeed2 = baseSpeed; // Short dial moves at the base speed
        current.isContinuous = true;
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

function adjustCanvasSize() {
  let maxWidth = windowWidth;
  let maxHeight = windowHeight;
  let aspectRatio = 3 / 4; // Your desired aspect ratio (width / height)

  // Calculate the maximum size maintaining the aspect ratio
  if (maxWidth > maxHeight * aspectRatio) {
    maxWidth = maxHeight * aspectRatio;
  } else {
    maxHeight = maxWidth / aspectRatio;
  }

  // Resize the canvas
  resizeCanvas(maxWidth, maxHeight);
}

function setup() {
  createCanvas(600, 800); // Set canvas size
  adjustCanvasSize();
  grid = new Grid(
    config.gridRatio.rows * config.gridSizeFactor,
    config.gridRatio.cols * config.gridSizeFactor
  );
  grid.applyAlignmentRules();
  textFont(customFont); // Set the loaded font as the default font
}
function windowResized() {
  adjustCanvasSize(); // Adjust canvas size when the window is resized
}

function draw() {
  // Set background and configure text properties
  background(config.themes[config.currentTheme].bg);
  fill(config.themes[config.currentTheme].titleColor);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("Time is a blind guide", width / 2, config.padding.top / 2);

  // Display all clocks on the grid
  grid.display();

  // Draw the frame around the canvas
  stroke(config.themes[config.currentTheme].frameColor);
  strokeWeight(config.frameThickness);
  noFill();
  rect(0, 0, width, height);

  strokeWeight(1); // Reset stroke weight to a default value appropriate for other elements

  grid.clocks.forEach((row) => row.forEach((clock) => clock.animateToTarget()));
  config.noiseOffset1 += 0.01; // Increment to animate the noise effect dynamically
}

function keyPressed() {
  if (key === "Q" || key === "q") {
    // Checks if 'Q' is pressed
    // Cycle through the theme names
    const themeNames = Object.keys(config.themes);
    let currentThemeIndex = themeNames.indexOf(config.currentTheme);
    currentThemeIndex = (currentThemeIndex + 1) % themeNames.length;
    config.currentTheme = themeNames[currentThemeIndex];
    console.log("Theme changed to: " + config.currentTheme); // Log the theme change
  } else if (key === "E" || key === "e") {
    // Checks if 'E' is pressed
    // Cycle through the rules
    const ruleNames = ["noise", "quarter", "rectangle", "circle", "gradient"]; // List all your rules here
    let currentRuleIndex = ruleNames.indexOf(config.currentRule);
    currentRuleIndex = (currentRuleIndex + 1) % ruleNames.length;
    config.currentRule = ruleNames[currentRuleIndex];
    grid.applyAlignmentRules(); // Re-apply rules to update the grid display
    console.log("Rule changed to: " + config.currentRule); // Log the rule change
  }
}
