from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings.fastembed import FastEmbedEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from dotenv import load_dotenv
import tempfile, os, uvicorn

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

vectorstore = None
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    global vectorstore
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
        f.write(await file.read())
        tmp_path = f.name
    loader = PyPDFLoader(tmp_path)
    documents = loader.load()
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)
    embeddings = FastEmbedEmbeddings(model_name="BAAI/bge-small-en-v1.5")
    vectorstore = FAISS.from_documents(chunks, embeddings)
    return {"message": f"Processed {len(documents)} pages, {len(chunks)} chunks"}

@app.post("/a
