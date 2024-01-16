const fs = require("fs");
const readline = require("readline");

// SIMPLEX metodo tableau

// O metodo e o dataset teve como base o video: "Método Simplex - Exemplo 1 (Maximização" do canal Simula EEL

// restricoes 
/*

max 10X1 +20X2 + 30X3

2X1 + 2X2 + 4x3 <= 300
4X2 + 3X3 <= 200
X1 <= 20
4X1 + 3X2  <= 200

X1, X2,X3 >= 0

*/
// dataset com a funcao objetivo rescrita 
// e tambem com as vaveriaveis de folga
let dataset: any = [
  {
    pivo: "f1",
    X1: 2,
    X2: 2,
    X3: 4,
    f1: 1,
    f2: 0,
    f3: 0,
    f4: 0,
    res: 300,
  },
  {
    pivo: "f2",
    X1: 0,
    X2: 4,
    X3: 3,
    f1: 0,
    f2: 1,
    f3: 0,
    f4: 0,
    res: 200,
  },
  {
    pivo: "f3",
    X1: 1,
    X2: 0,
    X3: 0,
    f1: 0,
    f2: 0,
    f3: 1,
    f4: 0,
    res: 20,
  },
  {
    pivo: "f4",
    X1: 4,
    X2: 3,
    X3: 0,
    f1: 0,
    f2: 0,
    f3: 0,
    f4: 1,
    res: 50,
  },
  {
    pivo: "Z",
    X1: -10,
    X2: -20,
    X3: -30,
    f1: 0,
    f2: 0,
    f3: 0,
    f4: 0,
    res: 0,
  },
];

console.table(dataset);

let foiResolvido = false;
let variaveis = ["X1", "X2", "X3"];
// troca de pivos
while (!foiResolvido) {
  // obtem a coluna de maior impacto
  // e faz com que essa linha seja atribuido 1 no valor
  const colunaDeMaiorImpacto = getColuna(dataset, variaveis);
  const linhaPivo = comparar(dataset, colunaDeMaiorImpacto);
  const novaLinha = dividirLinha(
    dataset,
    colunaDeMaiorImpacto.variavel,
    linhaPivo.pivo
  );
  dataset = substituirLinha(dataset, novaLinha, linhaPivo.pivo);
  console.table(dataset);

  const proximaLinhaPivo = dataset.find(
    (linha: any) => linha["pivo"] === linhaPivo.pivo
  );
  // transforma a coluna de maior impacto em coluna pivo
  // aplicando o metodo de gaus jordan
  for (const linha of dataset) {
    // obtem o valor que precisa ser zerado
    const valorVariavel = linha[colunaDeMaiorImpacto.variavel];

    // caso ja seja 0 ou esta na linha objetivo pula
    if (valorVariavel === 0 || linha["pivo"] === linhaPivo.pivo) {
      continue;
    }
    // realiza a substituicao a fim de zerar a variavel
    const linhaMultiplicada = multiplicarLinha(proximaLinhaPivo, valorVariavel);
    const linhaSubtraida = subtrairLinha(linha, linhaMultiplicada);
   
    dataset = substituirLinha(dataset, linhaSubtraida, linha.pivo);

    console.table(dataset);
  }

  // condicao de parada, sempre que nao houver valores negativos na linha Z
  foiResolvido = validarResolucao(dataset);
  console.log(foiResolvido);
}
// valida se tem algum valor negativo na linha da funcao objetivo
function validarResolucao(dataset: any) {
  const ultimaLinha = dataset[dataset.length - 1];
  let foiResolvido = true;

  for (const key in ultimaLinha) {
    const valor = ultimaLinha[key];
    if (key === "res") {
      continue;
    }
    if (valor < 0) {
      foiResolvido = false;
    }
  }

  return foiResolvido;
}
function subtrairLinha(linha1: any, linha2: any) {
  let linhaSubtraida = {};

  for (const key in linha1) {
    const valorDaLinha1 = linha1[key];
    const valorDaLinha2 = linha2[key];

    linhaSubtraida = {
      ...linhaSubtraida,
      [key]:
        typeof valorDaLinha1 === "number"
          ? valorDaLinha1 - valorDaLinha2
          : valorDaLinha1,
    };
  }

  return linhaSubtraida;
}

function multiplicarLinha(linha: any, multiplicador: any) {
  let linhaMultiplicada = {};

  for (const key in linha) {
    const valorDaLinha = linha[key];

    linhaMultiplicada = {
      ...linhaMultiplicada,
      [key]:
        typeof valorDaLinha === "number"
          ? valorDaLinha * multiplicador
          : valorDaLinha,
    };
  }

  return linhaMultiplicada;
}

function substituirLinha(dataset: any, novaLinha: any, pivo: any) {
  const index = dataset.findIndex((linha: any) => linha["pivo"] === pivo);
  dataset[index] = novaLinha;

  return dataset;
}

function dividirLinha(dataset: any, variavel: any, pivo: any) {
  const linha = dataset.find((linha: any) => linha["pivo"] === pivo);
  //obtem os valores da linha e elimina o valor do pivo
  const dividendos = Object.values(linha).filter((val) => val !== pivo);
  const divisor = linha[variavel];
  const resultado = dividendos.map((dividendo: any, index: number) => {
    if (divisor === 0 || dividendo === 0) {
      return 0;
    }
    return dividendo / divisor;
  });
  let novaLinha = {};
  let index = 0;
  for (const key in linha) {
    if (key === "pivo") {
      novaLinha = { ...novaLinha, [key]: pivo };

      continue;
    }
    novaLinha = { ...novaLinha, [key]: resultado[index] };

    index++;
  }

  return novaLinha;
}

function comparar(dataset: any, maiorImpacto: any) {
  const valoresColuna = dataset.map(
    (linha: any) => linha[maiorImpacto.variavel]
  );
  const valoresRes = dataset.map((linha: any) => linha["res"]);

  // dividir os valores da coluna res pela variavel

  const resultado = valoresRes.map((valor: number, index: number) => {
    const dividendo = valor;
    const divisor = valoresColuna[index];
    if (divisor === 0 || dividendo === 0) {
      return 0;
    }
    return dividendo / divisor;
  });

  const valoresPivo = dataset.map((linha: any) => linha["pivo"]);
  let linhaPivo = { valor: 0, pivo: "" };
  // obtem a linha pivo
  resultado.forEach((val: number, index: number) => {
    // desconsidera o zero e valores negativos
    if (val === 0 || val < 0) {
      return;
    }

    if (!linhaPivo.valor) {
      linhaPivo.valor = val;
      linhaPivo.pivo = valoresPivo[index];
    }
    //substitui pelo menor valor
    if (val <= linhaPivo.valor) {
      linhaPivo.valor = val;
      linhaPivo.pivo = valoresPivo[index];
    }
  });

  return linhaPivo;
}

function getColuna(dataset: any, variaveis: any) {
  const ultimaLinha = dataset[dataset.length - 1];
  let maiorImpacto = { variavel: "", valor: 0 };
  // pega a variavel de maior impacto
  variaveis.forEach((variavel: string, index: number) => {
    // obtem o modoulo do valor
    const valor = Math.abs(ultimaLinha[variavel]);
    if (index == 0) {
      maiorImpacto.valor = valor;
      maiorImpacto.variavel = variavel;
    }

    if (maiorImpacto.valor <= valor) {
      maiorImpacto.valor = valor;
      maiorImpacto.variavel = variavel;
    }
  });

  return maiorImpacto;
}
