-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "email" VARCHAR(128) NOT NULL,
    "password" VARCHAR(10000) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loadouts" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "switches" VARCHAR(128),
    "others" VARCHAR(128),
    "user_id" INTEGER,

    CONSTRAINT "loadouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "no_dupe_name" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "no_dupe_email" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "no_dupe_loadout" ON "loadouts"("name", "user_id");

-- AddForeignKey
ALTER TABLE "loadouts" ADD CONSTRAINT "loadouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;