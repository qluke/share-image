"use client";

/** @type {object} 设置项 */
let opt = {};
// 创建画布对象
let canvas = {};
let ctx = {};

/**
 * 初始化选项
 *
 * @param {object} input
 */
const initOpt = (input) => {
  opt = Object.assign(
    {
      size: "M",
      logo: AppLogo,
      appLogo: AppLogo,
      name: "这里是用户名",
      userId: "@User_ID or anything",
      bgColors: ["#ffafbd", "#ffc3a0"],
      cardBgColor: "rgba(255, 255, 255, .8)",
      contentColor: "#333336",
      nameColor: "#333336",
      userIdColor: "#333336",
      timeColor: "rgba(0, 0, 0, .5)",
      writeToClipboard: false,
      downloadToDisk: false,
    },
    input ? input : {}
  );
  /** ==== 如未设定，则计算默认值 ==== */
  /**
   * 如果属性不存在，则计算默认值
   *
   * @param {*} key
   * @param {*} defVal
   */
  const setSubOpt = (key, defVal) => {
    if (!opt[key]) opt[key] = defVal;
  };
  /** 图片宽度 */
  if (!opt.width) {
    switch (opt.size) {
      case "S":
        opt.width = 480;
        break;
      case "M":
        opt.width = 700;
        break;
      case "L":
        opt.width = 960;
        break;
      default:
        opt.width = 700;
        break;
    }
  }
  /** 文字大小 */
  setSubOpt("fontSize", Math.round(opt.width / opt.fontSizeRadio));
  setSubOpt("smallFontSize", Math.round(opt.fontSize * 0.6));
  /** 行高 */
  setSubOpt("lineHeight", 1.6);
  /** 段首缩进 */
  setSubOpt("indent", opt.fontSize * 2); /** 设置为0则不缩进 */
  /** 字体 */
  setSubOpt(
    "fontFamily",
    'Menlo, SFMono-Regular, Consolas, "Roboto Mono", "Source Code Pro", ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Microsoft YaHei", sans-serif'
  );
  /** 卡片外补 */
  setSubOpt("margin", Math.round(opt.width / 15));
  setSubOpt("marginLR", opt.margin);
  setSubOpt("marginTB", opt.margin);
  /** 卡片内补 */
  setSubOpt("padding", Math.round(opt.width / 12));
  setSubOpt("paddingLR", opt.padding);
  setSubOpt("paddingTB", opt.padding);
  /** Logo 尺寸 */
  setSubOpt("logoSize", 2 * opt.fontSize);
  /** 卡片圆角 */
  setSubOpt("cardRadius", Math.round(opt.fontSize / 2));

  /** ==== 必须通过计算得出的值 ==== */

  opt.cardWidth = opt.width - opt.marginLR * 2;
  opt.contentWidth = opt.cardWidth - opt.paddingLR * 2;
  opt.contentMarginLR = opt.marginLR + opt.paddingLR;
  opt.contentMarginTB = opt.marginTB + opt.paddingTB;
  opt.paragraphsMarginBottom = Math.round(opt.fontSize / 2);
};

/**
 * 数字两位化
 *
 * @param {number} num 0~99 的整数
 * @returnn {string}
 */
const dbNum = (num) => (num > 9 ? String(num) : "0" + num);
/** @type {array} */
const daysName = ["Sun.", "Mon.", "Tues.", "Wed.", "Thur.", "Fri.", "Sat."];
/**
 * 获取当前时间字符串
 *
 * @return {string}
 */
const getNowTime = () => {
  const now = new Date();
  const t = {
    YYYY: now.getFullYear(),
    MM: dbNum(now.getMonth() + 1),
    DD: dbNum(now.getDate()),
    hh: dbNum(now.getHours()),
    mm: dbNum(now.getMinutes()),
    ss: dbNum(now.getSeconds()),
    EE: daysName[now.getDay()],
  };
  return `${t.YYYY}-${t.MM}-${t.DD} ${t.EE} ${t.hh}:${t.mm}:${t.ss}`;
};

/**
 * 画布文字逐行分割
 *
 * @param {object} ctx 画布上下文对象
 * @param {string} text 要写入的文字内容
 * @param {number} width 文字内容在画布中占据的宽度
 * @return {array} 二维数组，第1层是段落，第2层是段落中的每一行
 */
const canvasTextSplit = (text, width) => {
  text = text.trim();
  if (text.length === 0) return [];
  const result = [];
  // 先进行段落的分割
  const paragraphArray = text
    .replace(/(\r?\n\s*)+/g, "\n")
    .split(/\s*\r?\n\s*/g);
  for (const p of paragraphArray) {
    const words = p.split(/\s/); // 将段落分割成单词数组
    const linesInParagraph = [];
    let currentLine = "";
    for (const word of words) {
      const potentialLineWidth = ctx.measureText(currentLine + word).width;
      const thisLineWidth = linesInParagraph.length
        ? width
        : width - opt.indent;
      if (potentialLineWidth > thisLineWidth) {
        // 当前行放不下这个单词，需要将当前行保存，并开始新的一行
        linesInParagraph.push(currentLine);
        currentLine = word; // 新的一行从当前单词开始
      } else {
        // 当前行还能放下这个单词，将其添加到当前行
        if (currentLine) {
          currentLine += " "; // 如果当前行已经有内容，加上空格
        }
        currentLine += word;
      }
    }
    // 添加最后一行（如果有的话）
    if (currentLine) {
      linesInParagraph.push(currentLine);
    }
    result.push(linesInParagraph);
  }
  return result;
};
/**
 * 将段落数组中的文字绘制到画布
 *
 * @param {object} ctx 画布上下文对象
 * @param {array} paragraphs 二维数组，第1层是段落，第2层是段落中的每一行
 * @param {number} startX 起始的横坐标
 * @param {number} startY 起始的纵坐标
 * @param {number} opt.lineHeight 行高
 * @return {number} 结束位置的纵坐标
 */
const drawText = async (paragraphs, startX, startY) => {
  let thisLineY = startY;
  paragraphs.forEach((p, pIndex) => {
    p.forEach((line, lIndex) => {
      const thisLineX = lIndex ? startX : startX + opt.indent;
      thisLineY += opt.lineHeight * opt.fontSize;
      ctx.fillText(line, thisLineX, thisLineY);
    });
    thisLineY += opt.paragraphsMarginBottom;
  });
  return thisLineY;
};
/**
 * 计算绘制文字所需要占据的高度
 *
 * @param {array} paragraphs 二维数组，第1层是段落，第2层是段落中的每一行
 * @param {number} opt.lineHeight 行高
 * @return {number} 文字内容所占据的高度
 */
const textNeedHeight = (paragraphs) => {
  return (
    (paragraphs.length - 1) * opt.paragraphsMarginBottom +
    paragraphs.flat().length * opt.lineHeight * opt.fontSize
  );
};
/**
 * 将 base64 格式的图片转换为 Blob 格式数据
 *
 * @param {string} dataUrl base64 格式的数据地址
 * @return {object} Blob 格式的图片数据
 */
const dataURLtoBlob = (dataUrl) => {
  const dataArr = dataUrl.split(",");
  const mime = dataArr[0].match(/:(.*?);/)[1];
  const bStr = atob(dataArr[1]);
  let n = bStr.length;
  const uint8Arr = new Uint8Array(n);
  while (n--) {
    uint8Arr[n] = bStr.charCodeAt(n);
  }
  return new Blob([uint8Arr], { type: mime });
};
/**
 * 将画布保存为图片并自动进行下载
 *
 * @param {object} canvas 画布对象
 * @param {string} name 保存的文件名
 * @param {string} [type="png"] 文件图片的格式: png、jpeg、gif
 */
const downloadImgFromCanvas = (name) => {
  // const imgDataUrl = canvas.toDataURL('image/'+type)
  const imgDataUrl = canvas.toDataURL({ format: "png", quality: 1 });
  const blob = dataURLtoBlob(imgDataUrl);
  const blobUrl = URL.createObjectURL(blob);
  const imgDownloadLink = document.createElement("a");
  imgDownloadLink.download = name + ".png";
  imgDownloadLink.href = blobUrl;
  imgDownloadLink.click();
};

/**
 * 设置填充色
 *
 * @param {string|array} colors
 */
const setFillColor = (colors) => {
  let fillColor;
  if (typeof colors === "string") {
    fillColor = colors;
  } else if (colors.length === 1) {
    fillColor = colors[0];
  } else {
    fillColor = ctx.createLinearGradient(0, 0, opt.width, opt.width / 8);
    const pointStep = 1 / (colors.length - 1);
    colors.forEach((c, i) => {
      fillColor.addColorStop(i * pointStep, c);
    });
  }
  ctx.fillStyle = fillColor;
};
/**
 * 画布字体设置
 *
 * @param {string|number} size
 * @param {string} color
 * @param {string} [weight='normal']
 * @param {string} [align='left']
 */
const setFont = (size, color, weight = "normal", align = "left") => {
  ctx.font = weight + " " + size + "px " + opt.fontFamily;
  ctx.textAlign = align;
  ctx.fillStyle = color;
};
/**
 * 设置画布阴影
 *
 * @param {number} x
 * @param {number} y
 * @param {number} blur
 * @param {string} [color='rgba(0, 0, 0, 0)']
 */
const setShadow = (x, y, blur, color = "rgba(0, 0, 0, 0)") => {
  ctx.shadowOffsetX = x;
  ctx.shadowOffsetY = y;
  ctx.shadowBlur = blur;
  ctx.shadowColor = color;
};
/**
 * 重置画布对象
 *
 * @param {number} height 画布的高度
 * @param {string} fillColor 画布填充的背景颜色
 */
const canvasRest = (height) => {
  canvas.width = opt.width;
  canvas.height = height;
  setShadow(0, 0, 0);
  setFillColor(opt.bgColors);
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

/**
 * 绘制圆角矩形
 *
 * @param {number} x
 * @param {number} y
 * @param {number} w
 * @param {number} h
 * @param {number} r
 */
const drawRoundedRect = (x, y, w, h, r) => {
  var ptA = { x: x + r, y: y };
  var ptB = { x: x + w, y: y };
  var ptC = { x: x + w, y: y + h };
  var ptD = { x: x, y: y + h };
  var ptE = { x: x, y: y };

  ctx.beginPath();

  ctx.moveTo(ptA.x, ptA.y);
  ctx.arcTo(ptB.x, ptB.y, ptC.x, ptC.y, r);
  ctx.arcTo(ptC.x, ptC.y, ptD.x, ptD.y, r);
  ctx.arcTo(ptD.x, ptD.y, ptE.x, ptE.y, r);
  ctx.arcTo(ptE.x, ptE.y, ptA.x, ptA.y, r);

  ctx.closePath();
  // ctx.stroke();
  ctx.fill();
};

/**
 * 同步载入图片
 *
 * @param {string} url
 * @param {number} l
 * @param {number} t
 */
const loadImage = async (url, l, t) =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, l, t, opt.logoSize, opt.logoSize);
      return resolve(true);
    };
    img.src = url;
  });

/**
 *
 */
async function get_tweet_card(inputContent, input, canvasContent) {
  canvas = canvasContent;
  ctx = canvas.getContext("2d");

  /** @type {string} 获取输入 */
  if (!inputContent) return;

  /** 初始化选项 */
  initOpt(input);

  /** 整理内容，计算尺寸 */
  setFont(opt.fontSize, opt.contentColor);
  const contentArr = canvasTextSplit(inputContent, opt.contentWidth);
  opt.contentHeight = textNeedHeight(contentArr);
  opt.cardHeight =
    opt.contentHeight +
    opt.paddingTB * 2 +
    opt.logoSize +
    opt.lineHeight * opt.fontSize /** 用来书写时间 */ +
    2 * opt.paragraphsMarginBottom; /** 放在内容上下 */
  opt.height = opt.cardHeight + 2 * opt.marginTB;
  /** 初始化画布 */
  canvasRest(opt.height);
  /** 绘制卡片 */
  setShadow(0, 0, opt.margin * 0.6, "rgba(0, 0, 0, .3)");
  ctx.fillStyle = opt.cardBgColor;
  drawRoundedRect(
    opt.marginLR,
    opt.marginTB,
    opt.cardWidth,
    opt.cardHeight,
    opt.cardRadius
  );

  /** 绘制内容文字 */
  setFont(opt.fontSize, opt.contentColor);
  setShadow(0, 0, 0);
  drawText(
    contentArr,
    opt.contentMarginLR,
    opt.contentMarginTB + opt.logoSize + opt.paragraphsMarginBottom
  );
  /** 绘制用户名 */
  setFont(opt.smallFontSize, opt.nameColor, "700");
  ctx.fillText(
    opt.name,
    opt.contentMarginLR + opt.logoSize + opt.smallFontSize,
    opt.contentMarginTB + Math.round(opt.logoSize / 2)
  );
  /** 绘制 UserID */
  setFont(opt.smallFontSize, opt.userIdColor, "200");
  ctx.fillText(
    opt.userId,
    opt.contentMarginLR + opt.logoSize + opt.smallFontSize,
    opt.contentMarginTB + Math.round(opt.logoSize * 0.98)
  );

  /** 绘制时间 */
  setFont(opt.smallFontSize, opt.timeColor, "200", "right");
  const nowTime = getNowTime();
  ctx.fillText(
    nowTime,
    opt.width - opt.marginLR - opt.paddingLR,
    canvas.height - opt.marginTB - opt.paddingTB
  );

  /** 绘制头像 */
  await loadImage(opt.logo, opt.contentMarginLR, opt.contentMarginTB);
  await loadImage(
    opt.appLogo,
    canvas.width - opt.marginLR - opt.paddingLR / 2 - opt.logoSize,
    opt.marginTB + opt.paddingTB / 2
  );

  /** 输出 */
  // 1. 输出到剪贴板
  if (opt.writeToClipboard) {
    await new Promise(async (reslove) => {
      canvas.toBlob(async (blob) => {
        // debugger
        let res = await navigator.clipboard.write([
          new ClipboardItem({
            [blob.type]: blob,
          }),
        ]);
        reslove();
      });
    });
  }

  // 2. 下载到本地
  if (opt.downloadToDisk) {
    downloadImgFromCanvas(nowTime);
  }

  return opt;
}
/** Obsidian Logo 256*256 */
const AppLogo = `data:image/png;base64,`;

module.exports = { get_tweet_card };
