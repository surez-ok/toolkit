let lastInputField = null;

document.getElementById('original').addEventListener('input', () => {
  lastInputField = 'original';
  document.getElementById('original').classList.remove("result");
});

document.getElementById('complement').addEventListener('input', () => {
  lastInputField = 'complement';
  document.getElementById('complement').classList.remove("result");
});

function parseNumber(value) {
  value = value.trim();

  if (value.startsWith('0x') || value.startsWith('0X')) {
    // 处理十六进制
    const hexStr = value.slice(2);
    if (!/^[0-9a-fA-F]+$/.test(hexStr)) {
      throw new Error(`无效的16进制数: ${value}`);
    }
    return BigInt('0x' + hexStr);
  } else {
    // 处理十进制
    if (!/^[-+]?[0-9]+$/.test(value)) {
      throw new Error(`无效的10进制数: ${value}`);
    }
    return BigInt(value);
  }
}

function toTwosComplement(num, bits) {
  const numBigInt = BigInt(num);
  const bitsBigInt = BigInt(bits);

  const maxVal = 1n << bitsBigInt;
  const minVal = -(1n << (bitsBigInt - 1n));

  if (numBigInt < minVal || numBigInt >= (maxVal - 1n)) {
    throw new Error(`超出${bits}位补码范围：${minVal} ~ ${maxVal - 1n}`);
  }

  // 计算补码二进制字符串
  const binStr = ((numBigInt + maxVal) % maxVal).toString(2).padStart(Number(bitsBigInt), '0');

  // 转为十六进制并补零到4位对齐
  const hexStr = BigInt("0b" + binStr).toString(16).toUpperCase().padStart(Math.ceil(bits / 4), '0');

  return "0x" + hexStr;
}

function fromTwosComplement(num, bits) {
  let bitsBigInt = BigInt(bits);

  // 解析为 BigInt
  let hexStr = num.toString(16);

  // 检查长度是否超过 bits 位
  if (hexStr.length * 4 > Number(bitsBigInt)) {
    throw new Error(`补码长度超过${bits}位`);
  }

  const maxSignBit = 1n << (bitsBigInt - 1n);
  if (num >= maxSignBit) {
    num -= (1n << bitsBigInt);
  }

  return num;
}

function convert() {
  const originalInput = document.getElementById('original').value.trim();
  const complementInput = document.getElementById('complement').value.trim();
  const errorMsg = document.getElementById('errorMsg');
  const bits = parseInt(document.getElementById('bits').value);
  errorMsg.textContent = "";

  try {
    if (!lastInputField) {
      throw new Error("原码框与补码框任一个都可以作为输入，此时另一个框则作为输出");
    }

    if (lastInputField === 'original') {
      // 原码 → 补码
      const num = parseNumber(originalInput);
      const compHex = toTwosComplement(num, bits);
      document.getElementById('complement').value = compHex;
      document.getElementById('original').style.color = 'black';
      document.getElementById('complement').style.color = 'red';
    } else if (lastInputField === 'complement') {
      // 补码 → 原码
      const hexStr = parseNumber(complementInput);
      const originalNum = fromTwosComplement(hexStr, bits);
      document.getElementById('original').value = originalNum;
      document.getElementById('original').style.color = 'red';
      document.getElementById('complement').style.color = 'black';
    }

  } catch (e) {
    errorMsg.textContent = "Error: " + e.message;
  }
}

function clearFields() {
  document.getElementById('original').value = "";
  document.getElementById('complement').value = "";
  lastInputField = null;
  document.getElementById('errorMsg').textContent = "";
  document.getElementById('original').style.color = 'black';
  document.getElementById('complement').style.color = 'black';
}