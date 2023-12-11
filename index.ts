const fs = require("fs");
const readline = require("readline");

async function simplexParser() {
  const linhas = await getLinhas("input.txt");
  // realiza a conversao das linhas para o modelo
  const tipoProblema = isMin(linhas[0]);
  const variaveis = getVariaveis(linhas[1]);
  const funcaoObjetivo = getFuncaoObjetivo(linhas[2], variaveis);
  const coeficientes = getCoeficientes(
    linhas.slice(3, linhas.length),
    variaveis
  );
  const restricaoDasVariaveis = getRestricaoVariaveis(variaveis);

  // printa o modelo
  console.log(`${tipoProblema} ${funcaoObjetivo}`);
  console.log("s.a.:");
  for (const coeficiente of coeficientes) {
    console.log(`  ${coeficiente}`);
  }
  console.log(`  ${restricaoDasVariaveis}`);
}

async function getLinhas(filePath: string) {
  const fileStream = fs.createReadStream(filePath);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // armazena as linhas em um vetor
  let linhas: string[] = [];
  for await (const line of rl) {
    linhas.push(line);
  }

  return linhas;
}

function isMin(val: string) {
  return (val = "-1" ? "min" : "max");
}

function getVariaveis(linha: string) {
  const vetorVariaveis = [];
  const nVariaveis = parseInt(linha);

  for (let i = 1; i <= nVariaveis; i++) {
    vetorVariaveis.push(`X${i}`);
  }

  return vetorVariaveis;
}

function getFuncaoObjetivo(linha: string, variaveis: string[]) {
  const coeficientes = linha.split(" ").filter((char) => char !== "");
  let expressao = "";

  for (let i = 0; i < coeficientes.length; i++) {
    const coeficienteAtual = coeficientes[i];

    const variavelAtual = variaveis[i];
    // caso for o primeiro nao precisa adcionar caractere +
    if (i === 0) {
      expressao += `${coeficienteAtual}${variavelAtual} `;
    } else if (i !== 0) {
      // caso nao for o primeiro e nem o ultimo indica que pode ser adicionado o caractere +
      const isPositivo = !coeficienteAtual.includes("-");
      expressao += isPositivo
        ? `+ ${coeficienteAtual}${variavelAtual} `
        : `${coeficienteAtual}${variavelAtual} `;
    }
  }

  return expressao;
}

function getCoeficientes(linhas: string[], variaveis: string[]) {
  let restricoes = [];

  for (const linha of linhas) {
    const restricao = getExpressao(linha, variaveis);

    restricoes.push(restricao);
  }

  return restricoes;
}

function getExpressao(linha: string, variaveis: string[]) {
  const coeficientes = linha.split(" ").filter((char) => char !== "");
  let expressao = "";

  for (let i = 0; i < coeficientes.length; i++) {
    const coeficienteAtual = coeficientes[i];
    const isUltimo = !!(i + 1 === coeficientes.length);
    // caso for o ultimo valor e o valor limitante
    if (isUltimo) {
      expressao += `<= ${coeficienteAtual}`;
      continue;
    }

    const variavelAtual = variaveis[i];
    // caso for o primeiro nao precisa adcionar caractere +
    if (i === 0) {
      expressao += `${coeficienteAtual}${variavelAtual} `;
    } else if (i !== 0 && !isUltimo) {
      // caso nao for o primeiro e nem o ultimo indica que pode ser adicionado o caractere +
      const isPositivo = !coeficienteAtual.includes("-");
      expressao += isPositivo
        ? `+ ${coeficienteAtual}${variavelAtual} `
        : `${coeficienteAtual}${variavelAtual} `;
    }
  }

  return expressao;
}

function getRestricaoVariaveis(variaveis: string[]) {
  const restricaoVar =
    variaveis.reduce((prev, current) => prev + current + ", ", "") + " >= 0";

  return restricaoVar;
}

simplexParser();
