# GRUPPEXAMINATION CRISIS AVERTED:

<br>

**KURS**:

_"Utveckling & driftsättning i molnmiljö"_

<br>

**GRUPPMEDLEMMAR**:

Magnus, Sandra Anton och Daniel.

<br>
<br>

## SETUP:

<br>

> [!IMPORTANT]  
> **För att projektet ska fungera behöver du göra 2 saker:**

<br>

**På samma fil-nivå som serverless.yml skapa en fil med namn:**

```
personal.yml
```

<br>

**I den behöver du två properties:**

```
org: dittOrganisationsNamn
role: arnAdressenTillDinRollSomHarLambdaOchDynamoDbAccess
```

<br>
<br>

## Förklaring:

<br>

Din "serverless.yml" har redan sökvägarna till "personal.yml" men det funkar såhär:

"custom" är en reserverad property i serverless. Här kan man spara properties som man själv bestämmer namnet på. I det här fallet har en property namnet secrets och håller sökvägen till en fil som håller properties med personlig information.

```
custom:
  secrets: ${file(./personal.yml)}
```

<br>

Ett exempel på hur du stegar sökvägen till en property i "personal.yml", i det här fallet org.

```
org: ${self:custom.secrets.org}
```
