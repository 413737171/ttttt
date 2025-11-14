// 測驗系統變數
let questions = [];
let currentQuestion = 0;
let score = 0;
let gameState = 'instructions'; // instructions, loading, quiz, result
let selectedAnswer = -1;
let showExplanation = false;
let explanationTimer = 0;
let csvData;

// UI變數
let buttonHeight = 60;
let buttonMargin = 15;
let questionFont, uiFont;

// 煙火特效變數
let fireworks = [];
let showFireworks = false;
let fireworkTimer = 0;

function preload() {
  // 載入CSV檔案
  csvData = loadTable('questions.csv', 'csv', 'header');
}

function setup() {
  let canvas = createCanvas(800, 600);
  // 將canvas放入指定的容器
  canvas.parent('sketch-container');
  
  // 載入CSV數據（在背景中）
  parseQuestions();
  
  // 從說明頁面開始
  gameState = 'instructions';
  
  // 設定文字
  textAlign(CENTER, CENTER);
}

function draw() {
  background(240, 248, 255);
  
  if (gameState === 'instructions') {
    drawInstructions();
  } else if (gameState === 'loading') {
    drawLoading();
  } else if (gameState === 'quiz') {
    drawQuiz();
  } else if (gameState === 'result') {
    drawResult();
  }
  
  // 更新和繪製煙火特效
  updateFireworks();
  drawFireworks();
}

function parseQuestions() {
  // 清空問題陣列
  questions = [];
  
  // 解析CSV數據
  for (let i = 0; i < csvData.getRowCount(); i++) {
    let question = {
      text: csvData.getString(i, '題目'),
      options: [
        csvData.getString(i, '選項A'),
        csvData.getString(i, '選項B'),
        csvData.getString(i, '選項C'),
        csvData.getString(i, '選項D')
      ],
      correctAnswer: csvData.getString(i, '正確答案'),
      explanation: csvData.getString(i, '解析')
    };
    questions.push(question);
  }
}

function drawInstructions() {
  // 背景
  fill(255);
  stroke(200);
  strokeWeight(2);
  rect(50, 50, width-100, height-100, 10);
  
  // 標題
  fill(30, 100, 180);
  textSize(32);
  textAlign(CENTER);
  text("📚 p5.js 選擇題測驗系統", width/2, 120);
  
  // 使用說明
  fill(50);
  textAlign(LEFT);
  textSize(18);
  text("使用說明：", 80, 170);
  
  textSize(16);
  let instructions = [
    "• 點擊選項按鈕立即查看正確答案和解析",
    "• 查看解析後點擊「下一題」按鈕或任意位置進入下一題", 
    "• 不操作的話系統會在5秒後自動進入下一題",
    "• 完成所有題目後可以重新開始測驗",
    "• 成績達到60分以上會有煙火慶祝特效！🎆"
  ];
  
  for (let i = 0; i < instructions.length; i++) {
    text(instructions[i], 80, 200 + i * 30);
  }
  
  // 開始作答按鈕
  fill(30, 150, 30);
  stroke(100);
  strokeWeight(2);
  rect(width/2 - 100, 400, 200, 60, 10);
  fill(255);
  textAlign(CENTER);
  textSize(22);
  text("開始作答", width/2, 430);
  
  // 題目數量提示
  fill(100);
  textSize(14);
  text(`共有 ${questions.length} 道題目`, width/2, 480);
}

function drawLoading() {
  fill(50);
  textSize(24);
  text("載入題庫中...", width/2, height/2);
}

function drawQuiz() {
  if (currentQuestion >= questions.length) {
    gameState = 'result';
    return;
  }
  
  let q = questions[currentQuestion];
  
  // 背景
  fill(255);
  stroke(200);
  strokeWeight(2);
  rect(50, 50, width-100, height-100, 10);
  
  // 標題
  fill(30, 100, 180);
  textSize(28);
  textAlign(CENTER);
  text(`測驗系統 - 第 ${currentQuestion + 1} / ${questions.length} 題`, width/2, 100);
  
  // 分數顯示
  fill(80);
  textSize(18);
  text(`目前分數: ${score} / ${currentQuestion}`, width/2, 130);
  
  if (!showExplanation) {
    // 顯示題目
    fill(50);
    textSize(20);
    textAlign(LEFT);
    let questionY = 180;
    
    // 分行顯示長題目
    let lines = splitTextToLines(q.text, width - 120);
    for (let i = 0; i < lines.length; i++) {
      text(lines[i], 70, questionY + i * 30);
    }
    
    // 顯示選項按鈕
    let startY = questionY + lines.length * 30 + 40;
    textAlign(CENTER);
    textSize(16);
    
    for (let i = 0; i < q.options.length; i++) {
      let buttonY = startY + i * (buttonHeight + buttonMargin);
      
      // 按鈕背景
      if (selectedAnswer === i) {
        fill(100, 150, 255);
      } else if (mouseX > 70 && mouseX < width-70 && 
                 mouseY > buttonY && mouseY < buttonY + buttonHeight) {
        fill(220, 230, 255);
      } else {
        fill(245, 245, 245);
      }
      
      stroke(150);
      strokeWeight(1);
      rect(70, buttonY, width-140, buttonHeight, 5);
      
      // 選項文字
      fill(50);
      textAlign(LEFT);
      text(`${String.fromCharCode(65 + i)}. ${q.options[i]}`, 85, buttonY + buttonHeight/2);
    }
    
    // 提示文字
    fill(100);
    textAlign(CENTER);
    textSize(16);
    text("點選答案即可查看正確解析", width/2, height - 60);
  } else {
    // 顯示解析
    drawExplanation(q);
  }
}

function drawExplanation(q) {
  // 你的答案
  fill(50);
  textSize(18);
  textAlign(LEFT);
  text(`你的答案: ${String.fromCharCode(65 + selectedAnswer)}`, 70, 180);
  
  // 正確答案
  let correctIndex = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer);
  fill(50);
  text(`正確答案: ${q.correctAnswer}`, 70, 210);
  
  // 答對或答錯
  if (selectedAnswer === correctIndex) {
    fill(0, 150, 0);
    text("✓ 答對了！", 70, 240);
  } else {
    fill(200, 50, 50);
    text("✗ 答錯了", 70, 240);
  }
  
  // 解析
  fill(50);
  textSize(16);
  text("解析:", 70, 280);
  
  let explanationLines = splitTextToLines(q.explanation, width - 120);
  for (let i = 0; i < explanationLines.length; i++) {
    text(explanationLines[i], 70, 310 + i * 25);
  }
  
  // 下一題按鈕
  fill(30, 150, 30);
  stroke(100);
  strokeWeight(2);
  rect(width/2 - 80, height - 100, 160, 40, 5);
  fill(255);
  textAlign(CENTER);
  textSize(18);
  text("下一題", width/2, height - 80);
  
  // 倒數計時
  let remainingTime = 5 - floor((millis() - explanationTimer) / 1000);
  if (remainingTime > 0) {
    fill(100);
    textAlign(CENTER);
    textSize(16);
    text(`或等待 ${remainingTime} 秒自動進入下一題`, width/2, height - 40);
  } else {
    nextQuestion();
  }
}

function drawResult() {
  // 背景
  fill(255);
  stroke(200);
  strokeWeight(2);
  rect(50, 50, width-100, height-100, 10);
  
  // 標題
  fill(30, 100, 180);
  textSize(32);
  textAlign(CENTER);
  text("測驗完成！", width/2, 150);
  
  // 分數
  fill(50);
  textSize(24);
  text(`最終分數: ${score} / ${questions.length}`, width/2, 200);
  
  // 分數評語
  let percentage = (score / questions.length) * 100;
  fill(100);
  textSize(20);
  let comment = "";
  if (percentage >= 90) comment = "優秀！";
  else if (percentage >= 80) comment = "很好！";
  else if (percentage >= 70) comment = "不錯！";
  else if (percentage >= 60) comment = "及格";
  else comment = "需要加強";
  
  text(`${percentage.toFixed(1)}% - ${comment}`, width/2, 240);
  
  // 煙火特效觸發（成績60%以上）
  if (percentage >= 60 && !showFireworks) {
    showFireworks = true;
    fireworkTimer = millis();
    // 初始煙火
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createFirework(), i * 500);
    }
  }
  
  // 煙火特效提示
  if (showFireworks) {
    fill(255, 100, 100);
    textSize(18);
    text("🎆 恭喜達到及格標準！ 🎆", width/2, 280);
  }
  
  // 重新開始按鈕
  fill(100, 150, 255);
  stroke(150);
  rect(width/2 - 100, 320, 200, 50, 5);
  fill(255);
  textSize(18);
  text("重新開始", width/2, 345);
}

function mousePressed() {
  if (gameState === 'instructions') {
    // 檢查開始作答按鈕
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
        mouseY > 400 && mouseY < 460) {
      gameState = 'quiz';
    }
  } else if (gameState === 'quiz' && !showExplanation) {
    // 檢查點擊的選項
    let q = questions[currentQuestion];
    let questionLines = splitTextToLines(q.text, width - 120);
    let startY = 180 + questionLines.length * 30 + 40;
    
    for (let i = 0; i < q.options.length; i++) {
      let buttonY = startY + i * (buttonHeight + buttonMargin);
      if (mouseX > 70 && mouseX < width-70 && 
          mouseY > buttonY && mouseY < buttonY + buttonHeight) {
        selectedAnswer = i;
        // 直接顯示解析，不需要再次點擊
        showAnswerExplanation();
        break;
      }
    }
  } else if (gameState === 'quiz' && showExplanation) {
    // 檢查是否點擊下一題按鈕
    if (mouseX > width/2 - 80 && mouseX < width/2 + 80 &&
        mouseY > height - 100 && mouseY < height - 60) {
      nextQuestion();
    } else {
      // 點擊其他位置也進入下一題
      nextQuestion();
    }
  } else if (gameState === 'result') {
    // 檢查重新開始按鈕
    if (mouseX > width/2 - 100 && mouseX < width/2 + 100 &&
        mouseY > 320 && mouseY < 370) {
      restartQuiz();
    }
  }
}

function showAnswerExplanation() {
  let q = questions[currentQuestion];
  let correctIndex = ['A', 'B', 'C', 'D'].indexOf(q.correctAnswer);
  
  if (selectedAnswer === correctIndex) {
    score++;
  }
  
  showExplanation = true;
  explanationTimer = millis();
}

function nextQuestion() {
  currentQuestion++;
  selectedAnswer = -1;
  showExplanation = false;
  
  if (currentQuestion >= questions.length) {
    gameState = 'result';
  }
}

function restartQuiz() {
  currentQuestion = 0;
  score = 0;
  selectedAnswer = -1;
  showExplanation = false;
  showFireworks = false;
  fireworks = [];
  gameState = 'quiz';
}

function splitTextToLines(text, maxWidth) {
  let words = text.split(' ');
  let lines = [];
  let currentLine = '';
  
  textSize(20);
  
  for (let word of words) {
    let testLine = currentLine + (currentLine ? ' ' : '') + word;
    if (textWidth(testLine) > maxWidth && currentLine !== '') {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

// 煙火粒子類別
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.vx = random(-8, 8);
    this.vy = random(-10, -2);
    this.gravity = 0.2;
    this.life = 255;
    this.color = color;
    this.trail = [];
  }
  
  update() {
    // 記錄軌跡
    this.trail.push({x: this.x, y: this.y, life: this.life});
    if (this.trail.length > 10) {
      this.trail.shift();
    }
    
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life -= 3;
  }
  
  display() {
    // 繪製軌跡
    for (let i = 0; i < this.trail.length; i++) {
      let alpha = map(i, 0, this.trail.length-1, 0, this.life);
      fill(red(this.color), green(this.color), blue(this.color), alpha * 0.5);
      noStroke();
      circle(this.trail[i].x, this.trail[i].y, map(i, 0, this.trail.length-1, 2, 6));
    }
    
    // 繪製粒子
    fill(red(this.color), green(this.color), blue(this.color), this.life);
    noStroke();
    circle(this.x, this.y, 6);
  }
  
  isDead() {
    return this.life <= 0;
  }
}

// 煙火類別
class Firework {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
    this.exploded = false;
    this.rocket = {
      x: x,
      y: height,
      vx: 0,
      vy: random(-12, -8),
      targetY: y
    };
    this.color = color(random(100, 255), random(100, 255), random(100, 255));
  }
  
  update() {
    if (!this.exploded) {
      // 火箭上升
      this.rocket.x += this.rocket.vx;
      this.rocket.y += this.rocket.vy;
      
      if (this.rocket.y <= this.rocket.targetY) {
        this.explode();
      }
    } else {
      // 更新爆炸粒子
      for (let i = this.particles.length - 1; i >= 0; i--) {
        this.particles[i].update();
        if (this.particles[i].isDead()) {
          this.particles.splice(i, 1);
        }
      }
    }
  }
  
  explode() {
    this.exploded = true;
    // 創建爆炸粒子
    for (let i = 0; i < 25; i++) {
      this.particles.push(new Particle(this.rocket.x, this.rocket.y, this.color));
    }
  }
  
  display() {
    if (!this.exploded) {
      // 繪製火箭
      fill(255, 200, 0);
      noStroke();
      circle(this.rocket.x, this.rocket.y, 4);
      
      // 火箭軌跡
      stroke(255, 200, 0, 150);
      strokeWeight(2);
      line(this.rocket.x, this.rocket.y, this.rocket.x, this.rocket.y + 20);
    } else {
      // 繪製爆炸粒子
      for (let particle of this.particles) {
        particle.display();
      }
    }
  }
  
  isDead() {
    return this.exploded && this.particles.length === 0;
  }
}

function createFirework() {
  let x = random(100, width - 100);
  let y = random(150, 300);
  fireworks.push(new Firework(x, y));
}

function updateFireworks() {
  if (showFireworks) {
    // 定期創建新煙火
    if (frameCount % 20 === 0) {
      createFirework();
    }
    
    // 更新現有煙火
    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      if (fireworks[i].isDead()) {
        fireworks.splice(i, 1);
      }
    }
  }
}

function drawFireworks() {
  if (showFireworks) {
    for (let firework of fireworks) {
      firework.display();
    }
  }
}
