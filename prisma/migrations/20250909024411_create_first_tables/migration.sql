-- CreateEnum
CREATE TYPE "public"."StatusMensagem" AS ENUM ('nao_lido', 'lido');

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id" SERIAL NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "bio" TEXT,
    "cidade" VARCHAR(100),
    "contato" VARCHAR(100),
    "foto_perfil" VARCHAR(255),
    "criado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descricao" TEXT,
    "imagem" VARCHAR(255),
    "data_postagem" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."posts_colaboracoes" (
    "post_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "posts_colaboracoes_pkey" PRIMARY KEY ("post_id","usuario_id")
);

-- CreateTable
CREATE TABLE "public"."catalogos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "nome" VARCHAR(150) NOT NULL,
    "descricao" TEXT,
    "data_criacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "catalogos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."catalogos_colaboracoes" (
    "catalog_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "catalogos_colaboracoes_pkey" PRIMARY KEY ("catalog_id","usuario_id")
);

-- CreateTable
CREATE TABLE "public"."catalogos_posts" (
    "catalog_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,

    CONSTRAINT "catalogos_posts_pkey" PRIMARY KEY ("catalog_id","post_id")
);

-- CreateTable
CREATE TABLE "public"."curtidas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "curtidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."comentarios" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "post_id" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comentarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mensagens" (
    "id" SERIAL NOT NULL,
    "remetente_id" INTEGER NOT NULL,
    "destinatario_id" INTEGER NOT NULL,
    "conteudo" TEXT NOT NULL,
    "data_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "public"."StatusMensagem" NOT NULL DEFAULT 'nao_lido',

    CONSTRAINT "mensagens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "public"."usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "curtidas_usuario_id_post_id_key" ON "public"."curtidas"("usuario_id", "post_id");

-- AddForeignKey
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts_colaboracoes" ADD CONSTRAINT "posts_colaboracoes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."posts_colaboracoes" ADD CONSTRAINT "posts_colaboracoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."catalogos" ADD CONSTRAINT "catalogos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."catalogos_colaboracoes" ADD CONSTRAINT "catalogos_colaboracoes_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "public"."catalogos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."catalogos_colaboracoes" ADD CONSTRAINT "catalogos_colaboracoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."catalogos_posts" ADD CONSTRAINT "catalogos_posts_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "public"."catalogos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."catalogos_posts" ADD CONSTRAINT "catalogos_posts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curtidas" ADD CONSTRAINT "curtidas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curtidas" ADD CONSTRAINT "curtidas_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comentarios" ADD CONSTRAINT "comentarios_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."comentarios" ADD CONSTRAINT "comentarios_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mensagens" ADD CONSTRAINT "mensagens_remetente_id_fkey" FOREIGN KEY ("remetente_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."mensagens" ADD CONSTRAINT "mensagens_destinatario_id_fkey" FOREIGN KEY ("destinatario_id") REFERENCES "public"."usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
