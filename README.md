# Candy & Edwin — Invitación digital

Next.js + Vercel + Neon PostgreSQL.

## Desarrollo
```bash
npm install
npm run dev
```

## Neon (pendiente de vinculación)
1. En Vercel Marketplace, abre Neon y crea o vincula una base de datos al proyecto `boda-candy-edwin-git`.
2. Comprueba que exista `DATABASE_URL` en los entornos Production y Preview (no compartas su valor).
3. Ejecuta `db/schema.sql` en el SQL Editor de Neon.
4. Para cada invitación, genera un token aleatorio de 24 bytes (48 caracteres hexadecimales), almacena **solo** su SHA-256 en `invitations.token_hash`, crea sus invitados en `guests`, y comparte `https://tu-dominio/?invite=TOKEN`.
5. El formulario público solo funciona para enlaces válidos y actualiza las respuestas de los nombres asignados. No permite añadir cupos.
6. No publiques enlaces reales en el repositorio ni en capturas.

**Importante:** no se han creado todavía la base de datos ni los registros de invitados. Falta implementar un panel administrativo autenticado para gestionar las 5 agrupaciones de 10 invitados.
