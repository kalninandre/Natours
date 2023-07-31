# Natours

Um aplicativo utilizando a arquitetura MVC junto à tecnologia Node.Js, que objetiva ser um serviço de reserva de viagens, integrando vários estabalecimentos e companhias

### Para sua utilização, é necessário um **.env** que conhtenha no mínimo, estas informações:

```
  PORT=<Your port>
  ENV=DEV

  DB_USER=<MONGODB USER>
  DB_PASSWORD=<MONGODB PASSWORD>
  DB_CONNECTION_STRING=<MONGODB CONNECTION STRING>

  JWT_SECRET=<YOUR JWT SECRET FOR TOKEN GENERATION>
  JWT_EXPIRATION=<TIME IN VERCEL/MS FORMAT>

  MAILTRAP_USER=<MAILTRAP USER>
  MAILTRAP_PASSWORD=<MAILTRAP PASSWORD>
  MAILTRAP_PORT=<MAILTRAP PORT>
  EMAIL_FROM=<THE EMAIL THAT WILL APPEAR ON THE 'FROM' FIELD>
```
