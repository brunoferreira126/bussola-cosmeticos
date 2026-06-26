import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { auth, db, firebaseConfigurado } from "./firebase";

// Gera um código legível e único usando o primeiro nome e parte do UID.
function gerarCodigoIndicacao(nome, uid) {
  const primeiroNome = nome
    .trim()
    .split(" ")[0]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);

  return `${primeiroNome || "CLIENTE"}${uid.slice(0, 5).toUpperCase()}`;
}

function exigirFirebase() {
  if (!firebaseConfigurado) {
    throw new Error("Firebase ainda não configurado.");
  }
}

export function observarAutenticacao(callback) {
  exigirFirebase();
  return onAuthStateChanged(auth, callback);
}

export async function cadastrarCliente(dados) {
  exigirFirebase();

  const credencial = await createUserWithEmailAndPassword(
    auth,
    dados.email,
    dados.senha,
  );

  const uid = credencial.user.uid;
  const codigoIndicacao = gerarCodigoIndicacao(dados.nome, uid);
  const codigoRecebido = dados.codigoRecebido.trim().toUpperCase();

  await updateProfile(credencial.user, { displayName: dados.nome });

  // O lote garante que perfil, código e vínculo de indicação sejam gravados
  // juntos. Se alguma etapa falhar, nenhuma fica pela metade.
  const lote = writeBatch(db);
  lote.set(doc(db, "clientes", uid), {
    nome: dados.nome,
    email: dados.email.toLowerCase(),
    whatsapp: dados.whatsapp,
    cidade: dados.cidade,
    nascimento: dados.nascimento || null,
    codigoIndicacao,
    role: "cliente",
    criadoEm: serverTimestamp(),
  });
  lote.set(doc(db, "codigosIndicacao", codigoIndicacao), {
    clienteId: uid,
    primeiroNome: dados.nome.trim().split(" ")[0],
    criadoEm: serverTimestamp(),
  });

  if (codigoRecebido) {
    const codigoOrigem = await getDoc(
      doc(db, "codigosIndicacao", codigoRecebido),
    );

    if (codigoOrigem.exists() && codigoOrigem.data().clienteId !== uid) {
      const origem = codigoOrigem.data();

      lote.set(doc(db, "indicacoes", uid), {
        clienteOrigem: origem.clienteId,
        clienteIndicado: uid,
        nomeIndicado: dados.nome,
        nomeOrigem: origem.primeiroNome,
        codigoOrigem: codigoRecebido,
        status: "cadastrado",
        criadoEm: serverTimestamp(),
      });
    }
  }

  await lote.commit();
  return credencial.user;
}

export async function entrarCliente(email, senha) {
  exigirFirebase();
  return signInWithEmailAndPassword(auth, email, senha);
}

export async function sairCliente() {
  exigirFirebase();
  return signOut(auth);
}

export async function recuperarSenha(email) {
  exigirFirebase();
  return sendPasswordResetEmail(auth, email);
}

export function observarPerfil(uid, callback) {
  exigirFirebase();
  return onSnapshot(doc(db, "clientes", uid), (snapshot) => {
    callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
  });
}

export function observarIndicacoes(uid, callback) {
  exigirFirebase();
  const consulta = query(
    collection(db, "indicacoes"),
    where("clienteOrigem", "==", uid),
    orderBy("criadoEm", "desc"),
  );

  return onSnapshot(consulta, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export function observarEquipe(uid, callback) {
  exigirFirebase();
  return onSnapshot(doc(db, "equipe", uid), (snapshot) => {
    callback(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
  });
}

export function observarPendentes(callback) {
  exigirFirebase();
  const consulta = query(
    collection(db, "indicacoes"),
    where("status", "==", "cadastrado"),
    orderBy("criadoEm", "desc"),
  );

  return onSnapshot(consulta, (snapshot) => {
    callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  });
}

export async function validarCompra(indicacaoId, atendenteId) {
  exigirFirebase();
  return updateDoc(doc(db, "indicacoes", indicacaoId), {
    status: "comprou",
    validadaEm: serverTimestamp(),
    validadaPor: atendenteId,
  });
}

export async function solicitarBeneficio(clienteId, recompensa) {
  exigirFirebase();
  return addDoc(collection(db, "beneficiosSolicitados"), {
    clienteId,
    meta: recompensa.meta,
    premio: recompensa.premio,
    status: "solicitado",
    criadoEm: serverTimestamp(),
  });
}

// Uso reservado para a criação manual da primeira conta administrativa.
export async function criarPerfilEquipe(uid, role = "atendente") {
  exigirFirebase();
  return setDoc(doc(db, "equipe", uid), { role });
}
