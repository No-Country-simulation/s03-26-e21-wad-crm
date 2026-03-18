# 📘 Backend for App ✨

- [`📚 Root`](../README.md)/[`📕 Frontend`](../Frontend/README.md)/
- [`📚 Root`](../README.md)/`📖 Backend`/

## 📖 Table of Contents

- [📘 Backend for App ✨](#-backend-for-app-)
  - [📖 Table of Contents](#-table-of-contents)
  - [👀 Motivation 🔝](#-motivation-)
  - [🧰 Technology Stack 🔝](#-technology-stack-)
  - [🤵‍♂️ Team communication channels 🔝](#️-team-communication-channels-)
  - [🧑‍💻 Developer Teams 🔝](#-developer-teams-)
  - [🗃️ Project info 🔝](#️-project-info-)
    - [📚 License 🔝](#-license-)
    - [📚 Workspaces 🔝](#-workspaces-)
    - [📚 Deploy 🔝](#-deploy-)
  - [🛠️ Guía de instalación 🔝](#️-guía-de-instalación-)
    - [📚 Comandos para instalar 🔝](#-comandos-para-instalar-)
    - [📚 Crear un super usuario 🔝](#-crear-un-super-usuario-)
    - [📚 Levantar el backend 🔝](#-levantar-el-backend-)
    - [¡Y Listo! Has terminado de correr el backend 🥳 🔝](#y-listo-has-terminado-de-correr-el-backend--)

## 👀 Motivation [🔝](#-backend-for-app-)

The backend of Testimonial CMS is built with Django and PostgreSQL, providing a solid, scalable, and secure foundation for managing testimonials in multiple formats (text, image, and video). It features a role-based authentication system (admin, editor, visitor), a fully documented REST API, and support for moderation, curation, and engagement analytics. It also integrates with external services like YouTube API and Cloudinary for multimedia management, ensuring flexibility and high performance in content-heavy environments.

## 🧰 Technology Stack [🔝](#-backend-for-app-)

[![Python Link](https://img.shields.io/badge/Python-3776AB.svg?style=for-the-badge&logo=Python&logoColor=white 'Python link')](https://www.python.org/)
[![Django link](https://img.shields.io/badge/Django-092E20.svg?style=for-the-badge&logo=Django&logoColor=white, 'Django Link')](https://www.djangoproject.com/)
[![Swagger Link](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=Swagger&logoColor=black 'Swagger Link')](https://swagger.io/)
[![Markdown Link](https://img.shields.io/badge/Markdown-03a7dd?style=for-the-badge&logo=markdown&logoColor=white 'Markdown Link')](https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)
[![Cloudinary Link](https://img.shields.io/badge/cloudinary-%233448C5?style=for-the-badge&logo=cloudinary&logoColor=ffffff 'Cloudinary Link')](https://cloudinary.com/)
[![Zod Link](https://img.shields.io/badge/zod-3E67B1?style=for-the-badge&logo=zod&logoColor=892CA0&color=313131)](https://zod.dev/ 'Zod Link')
[![JSON_WEB_TOKENS Link](https://img.shields.io/badge/JSON_WEB_TOKENS-212121?style=for-the-badge&logo=jsonwebtokens&logoColor=ffffff 'JSON_WEB_TOKENS Link')](https://jwt.io/)
[![Postgres](https://img.shields.io/badge/Postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=fff&style=for-the-badge)](https://www.docker.com/)

## 🤵‍♂️ Team communication channels [🔝](#-backend-for-app-)

[![No Country](https://img.shields.io/badge/No_Country-ff69b4?style=for-the-badge&logo=data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8IS0tIENyZWF0b3I6IENvcmVsRFJBVyAyMDIwICg2NC1CaXQgVmVyc2nDs24gZGUgZXZhbHVhY2nDs24pIC0tPg0KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIyMjY1cHgiIGhlaWdodD0iMTc4M3B4IiB2ZXJzaW9uPSIxLjEiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiBpbWFnZS1yZW5kZXJpbmc9Im9wdGltaXplUXVhbGl0eSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiDQp2aWV3Qm94PSIwIDAgMjI2NSAxNzgzLjE5Ig0KIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIg0KIHhtbG5zOnhvZG09Imh0dHA6Ly93d3cuY29yZWwuY29tL2NvcmVsZHJhdy9vZG0vMjAwMyI+DQogPGRlZnM+DQogICA8bGluZWFyR3JhZGllbnQgaWQ9ImlkMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiIHgxPSIwIiB5MT0iODkxLjU5IiB4Mj0iMjI2NSIgeTI9Ijg5MS41OSI+DQogICAgPHN0b3Agb2Zmc2V0PSIwIiBzdG9wLW9wYWNpdHk9IjEiIHN0b3AtY29sb3I9IiNGQjAzOTUiLz4NCiAgICA8c3RvcCBvZmZzZXQ9IjAuMDQzMTM3MyIgc3RvcC1vcGFjaXR5PSIxIiBzdG9wLWNvbG9yPSIjRUUwRDlBIi8+DQogICAgPHN0b3Agb2Zmc2V0PSIwLjA5MDE5NjEiIHN0b3Atb3BhY2l0eT0iMSIgc3RvcC1jb2xvcj0iI0UwMTc5RiIvPg0KICAgIDxzdG9wIG9mZnNldD0iMC43MDk4MDQiIHN0b3Atb3BhY2l0eT0iMSIgc3RvcC1jb2xvcj0iIzFGQThFMyIvPg0KICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1vcGFjaXR5PSIxIiBzdG9wLWNvbG9yPSIjMDNCREVEIi8+DQogICA8L2xpbmVhckdyYWRpZW50Pg0KIDwvZGVmcz4NCiA8ZyBpZD0iQ2FwYV94MDAyMF8xIj4NCiAgPG1ldGFkYXRhIGlkPSJDb3JlbENvcnBJRF8wQ29yZWwtTGF5ZXIiLz4NCiAgPHBhdGggZmlsbD0idXJsKCNpZDApIiBkPSJNMCA2MzEuMTZjMjUuNjEsMCA1Ny42OSwtOC44MSA4Mi4zOCwtMTMuNTkgNzcuNjksLTE1LjA0IDEzOS4xMSwtMTkuMjkgMjEyLjU3LDE0Ljk1IDUxLjE1LDIzLjg0IDc1LjgsNDIuMjUgMTA3LjAzLDgwLjY2IDcuNTMsOS4yNiA5LjM2LDEwLjk3IDE2LjI4LDIxLjI1IDMwLjE4LDQ0Ljg4IDU3LjUyLDExMS45NCA1Ny41MiwxNjcuNTggMCw3OC45MSAtNDYuOTUsMTY4LjUxIC04Ni41MiwyMDkuNDggLTE1MS4xMSwxNTYuNDggLTMwOC44NSw2My4xNiAtMzg5LjI2LDYxLjM3bDQuMTcgMTAwLjAxYzAsNzMuNDcgLTMuNjEsMTUwLjk3IC00LjE3LDIyNS42OGwwIDM2LjY3YzAuMjgsMzMuMDcgMS4zOSw2NS4zNiAzLjk1LDk2LjIzIDQuOTUsNTkuNzEgLTI0LjQ4LDEzNy4yOSA4Ny44NywxMzcuMjlsNDc1Ljc3IDBjMTE2LjAyLDAgODQuODksLTQ3LjUyIDYwLjg0LC0xMzEuNTggLTM0LjA3LC0xMTkuMSAtMjQuNTEsLTIwMi40NSA1Ny4yMSwtMzAwLjYgOS41MywtMTEuNDUgMjMuODksLTIxLjY3IDM1Ljc1LC0zMC45OCAxMi4wNywtOS40NyAyOC42MSwtMjAuMjUgNDMuNjcsLTI3LjIzIDM4LjM1LC0xNy43NyA2NS41NiwtMjMuOTcgMTEyLjY1LC0yOS41NCAzMS41NiwtMy43MyA5MC44NiwxMiAxMTIuODgsMjIuNTggMzIuNzUsMTUuNzQgNTcuMDEsMzIuNTcgODAuOTYsNTYuNjggMjM1Ljg2LDIzNy40NyAtMTAzLjUyLDQ0MC42NyAxMzAuNDEsNDQwLjY3bDQ5Mi40NyAwYzg2LjMzLDAgNzAuOTUsLTEwNC4zNSA3MC45NSwtMTYyLjUxbDAgLTM1MC4wM2MtMC4wMiwtMzcuNTggLTIuOTgsLTgxLjU1IDIwLjEzLC05Ni44NiA0Ny44OCwtMzEuNzMgMTk2LjUsMTMxLjU2IDM4OS45MiwtNjAuNDQgMTQuNTgsLTE0LjQ3IDIwLjc4LC0yMS4zNCAzMy4wMSwtMzcuODggOC44NSwtMTEuOTYgMjIuNDMsLTMzLjQxIDI4LjU1LC00Ni40OSAyNy4wMiwtNTcuNzMgMzYuMDksLTExOS4zMyAyMC4xMywtMTgyLjYzIC01LjIzLC0yMC43NiAtMTAuMDYsLTM2LjE0IC0xOC4zLC01Ni43MyAtMjguMDcsLTcwLjE0IC03NC45MywtMTIyLjE3IC0xNDAuOTQsLTE1NS4xNCAtMTY4LjU1LC04NC4xOCAtMzA2LjEsMzQuNjEgLTMyNi43NSwtMjMuNzcgLTE2LjU5LC00Ni44NyA0LjQ4LC00NTMuMzUgLTEwLjg4LC01MzkuMTkgLTUuNTcsLTMxLjEzIC0zMi4yMywtNDIuNjIgLTY5Ljk5LC00Mi42MmwtNDAzLjQ4IDBjLTU2Ljg1LDEuMzUgLTEwMS41NywzLjgyIC0xMTguNDMsOC4xMSAtMTAyLjk3LDI2LjIgLTQzLjAyLDg4LjggLTI0Ljc4LDEyOS4zNyAxNy4wNCwzNy45MSAxNi42Niw3Ny45OSAxNi42NiwxMjAuODcgMCwxMzUuNTYgLTEzMS43OSwyNTguMzUgLTI3MS4yOCwyNTguMzUgLTExOC40NCwwIC0yMTEuMTMsLTU5Ljc0IC0yNTUuODYsLTE2NS40IC0yNS4wNSwtNTkuMTggLTMwLjgzLC0xMjUuNTQgLTExLjgyLC0xODkuMzdsMjYuMjQgLTY5LjY0YzI0LjQ5LC02Ni4zMSAzLjYxLC05Mi4yOSAtNzEuNTcsLTkyLjI5bC00ODQuMTIgMGMtNjYuNjIsMCAtODQuNTQsMjQuMzcgLTg3LjY4LDg3LjQ3IC0yLjgxLDU2LjY3IDAuMDMsMTIxLjYyIDAuMDMsMTc5LjIxIDAsMTIxLjcgLTQuMTcsMjI5LjQ3IC00LjE3LDM1MC4wM3oiLz4NCiA8L2c+DQo8L3N2Zz4NCg==&logoColor=ffffff&color=2e184f)](https://www.nocountry.tech/ 'No Country Link')
[![Discord Link](https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white 'Discord Link')](https://discord.com)
[![LinkedIn](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin-white&logoColor=fff)](https://linkedIn.com)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://www.whatsapp.com/?lang=es)

## 🧑‍💻 Developer Teams [🔝](#-backend-for-app-)

| ![Avatar](https://avatars.githubusercontent.com/u/141883724?s=96&v=4) |
|:-:|
|**Jesus Medina**|
| [![Github Link](https://img.shields.io/badge/github-%23121011.svg?&style=for-the-badge&logo=github&logoColor=white 'Github Link')](https://github.com/JesusMedina21) [![LinkedIn Link](https://custom-icon-badges.demolab.com/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin-white&logoColor=fff 'LinkedIn Link')](https://www.linkedin.com/in/jesusmedina-dev/ ) |

## 🗃️ Project info [🔝](#-backend-for-app-)

### 📚 License [🔝](#-backend-for-app-)

| License |
| :-: |
|[![License Link](https://img.shields.io/badge/MIT-FF0000?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCAxNiAxNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTguNzQ5OTEgMC43NVYySDkuNzM0OTFDMTAuMDM4OSAyIDEwLjMzNzkgMi4wOCAxMC42MDE5IDIuMjMxTDExLjg5MTkgMi45NjdDMTEuOTI5OSAyLjk4OSAxMS45NzE5IDMgMTIuMDE1OSAzSDE0LjI0OTlDMTQuNDQ4OCAzIDE0LjYzOTYgMy4wNzkwMiAxNC43ODAyIDMuMjE5NjdDMTQuOTIwOSAzLjM2MDMyIDE0Ljk5OTkgMy41NTEwOSAxNC45OTk5IDMuNzVDMTQuOTk5OSAzLjk0ODkxIDE0LjkyMDkgNC4xMzk2OCAxNC43ODAyIDQuMjgwMzNDMTQuNjM5NiA0LjQyMDk4IDE0LjQ0ODggNC41IDE0LjI0OTkgNC41SDEzLjgyMjlMMTUuOTMzOSA5LjE5MkMxNS45OTYzIDkuMzMwODEgMTYuMDE1IDkuNDg1MzEgMTUuOTg3NSA5LjYzNDk5QzE1Ljk2IDkuNzg0NjcgMTUuODg3NiA5LjkyMjQ0IDE1Ljc3OTkgMTAuMDNMMTUuMjQ5OSA5LjVMMTUuNzc4OSAxMC4wMzFMMTUuNzc3OSAxMC4wMzNMMTUuNzc1OSAxMC4wMzVMMTUuNzY5OSAxMC4wNDFMMTUuNzYzOSAxMC4wNDZMMTUuNzUzOSAxMC4wNTZMMTUuNzA4OSAxMC4wOTZDMTUuNDk4OSAxMC4yNzIgMTUuMjY3OSAxMC40MjMgMTUuMDIyOSAxMC41NDZDMTQuNTU1OSAxMC43OCAxMy44Nzk5IDExIDEyLjk5OTkgMTFDMTIuMjk5NCAxMS4wMDgzIDExLjYwNjcgMTAuODUyOCAxMC45NzY5IDEwLjU0NkMxMC43MzE2IDEwLjQyMzEgMTAuNTAxNCAxMC4yNzIxIDEwLjI5MDkgMTAuMDk2TDEwLjI0NTkgMTAuMDU2TDEwLjIyOTkgMTAuMDQxTDEwLjIyMzkgMTAuMDM1TDEwLjIxOTkgMTAuMDMxVjEwLjAzQzEwLjExMjIgOS45MjI0NCAxMC4wMzk5IDkuNzg0NjcgMTAuMDEyNCA5LjYzNDk5QzkuOTg0ODUgOS40ODUzMSAxMC4wMDM1IDkuMzMwODEgMTAuMDY1OSA5LjE5MkwxMi4xNzc5IDQuNUgxMi4wMTU5QzExLjcxMDkgNC41IDExLjQxMTkgNC40MjEgMTEuMTQ3OSA0LjI2OUw5Ljg1NzkxIDMuNTMzQzkuODIwMjQgMy41MTExOCA5Ljc3NzQ0IDMuNDk5NzkgOS43MzM5MSAzLjVIOC43NDk5MVYxM0gxMS4yNDk5QzExLjQ0ODggMTMgMTEuNjM5NiAxMy4wNzkgMTEuNzgwMiAxMy4yMTk3QzExLjkyMDkgMTMuMzYwMyAxMS45OTk5IDEzLjU1MTEgMTEuOTk5OSAxMy43NUMxMS45OTk5IDEzLjk0ODkgMTEuOTIwOSAxNC4xMzk3IDExLjc4MDIgMTQuMjgwM0MxMS42Mzk2IDE0LjQyMSAxMS40NDg4IDE0LjUgMTEuMjQ5OSAxNC41SDQuNzQ5OTFDNC41NTA5OSAxNC41IDQuMzYwMjMgMTQuNDIxIDQuMjE5NTggMTQuMjgwM0M0LjA3ODkyIDE0LjEzOTcgMy45OTk5MSAxMy45NDg5IDMuOTk5OTEgMTMuNzVDMy45OTk5MSAxMy41NTExIDQuMDc4OTIgMTMuMzYwMyA0LjIxOTU4IDEzLjIxOTdDNC4zNjAyMyAxMy4wNzkgNC41NTA5OSAxMyA0Ljc0OTkxIDEzSDcuMjQ5OTFWMy41SDYuMjY1OTFDNi4yMjIzOCAzLjQ5OTc5IDYuMTc5NTcgMy41MTExOCA2LjE0MTkxIDMuNTMzTDQuODUyOTEgNC4yN0M0LjU4NzkxIDQuNDIgNC4yODg5MSA0LjUgMy45ODM5MSA0LjVIMy44MjE5MUw1LjkzMzkxIDkuMTkyQzUuOTk2MjkgOS4zMzA4MSA2LjAxNDk3IDkuNDg1MzEgNS45ODc0NiA5LjYzNDk5QzUuOTU5OTUgOS43ODQ2NyA1Ljg4NzU2IDkuOTIyNDQgNS43Nzk5MSAxMC4wM0w1LjI0OTkxIDkuNUw1Ljc3ODkxIDEwLjAzMUw1Ljc3NzkxIDEwLjAzM0w1Ljc3NTkxIDEwLjAzNUw1Ljc2OTkxIDEwLjA0MUw1Ljc1MzkxIDEwLjA1Nkw1LjcwODkxIDEwLjA5NkM1LjQ5ODkxIDEwLjI3MiA1LjI2NzkxIDEwLjQyMyA1LjAyMjkxIDEwLjU0NkM0LjU1NTkxIDEwLjc4IDMuODc5OTEgMTEgMi45OTk5MSAxMUMyLjI5OTQyIDExLjAwODMgMS42MDY2OSAxMC44NTI4IDAuOTc2OTA3IDEwLjU0NkMwLjczMTU5IDEwLjQyMzEgMC41MDEzODEgMTAuMjcyMSAwLjI5MDkwNyAxMC4wOTZMMC4yNDU5MDcgMTAuMDU2TDAuMjI5OTA3IDEwLjA0MUwwLjIyMzkwNyAxMC4wMzVMMC4yMTk5MDcgMTAuMDMxVjEwLjAzQzAuMTEyMjQ4IDkuOTIyNDQgMC4wMzk4NTkzIDkuNzg0NjcgMC4wMTIzNTI5IDkuNjM0OTlDLTAuMDE1MTUzNSA5LjQ4NTMxIDAuMDAzNTI0NjUgOS4zMzA4MSAwLjA2NTkwNjYgOS4xOTJMMi4xNzc5MSA0LjVIMS43NDk5MUMxLjU1MDk5IDQuNSAxLjM2MDIzIDQuNDIwOTggMS4yMTk1OCA0LjI4MDMzQzEuMDc4OTIgNC4xMzk2OCAwLjk5OTkwNyAzLjk0ODkxIDAuOTk5OTA3IDMuNzVDMC45OTk5MDcgMy41NTEwOSAxLjA3ODkyIDMuMzYwMzIgMS4yMTk1OCAzLjIxOTY3QzEuMzYwMjMgMy4wNzkwMiAxLjU1MDk5IDMgMS43NDk5MSAzSDMuOTgzOTFDNC4wMjc3NSAzLjAwMDIgNC4wNzA4NyAyLjk4ODgxIDQuMTA4OTEgMi45NjdMNS4zOTY5MSAyLjIzQzUuNjYxOTEgMi4wOCA1Ljk2MDkxIDIgNi4yNjU5MSAySDcuMjQ5OTFWMC43NUM3LjI0OTkxIDAuNTUxMDg4IDcuMzI4OTIgMC4zNjAzMjIgNy40Njk1OCAwLjIxOTY3QzcuNjEwMjMgMC4wNzkwMTc2IDcuODAwOTkgMCA3Ljk5OTkxIDBDOC4xOTg4MiAwIDguMzg5NTggMC4wNzkwMTc2IDguNTMwMjQgMC4yMTk2N0M4LjY3MDg5IDAuMzYwMzIyIDguNzQ5OTEgMC41NTEwODggOC43NDk5MSAwLjc1Wk0xMS42OTQ5IDkuMjI3QzExLjk3OTkgOS4zNjIgMTIuNDEyOSA5LjUgMTIuOTk5OSA5LjVDMTMuNTg2OSA5LjUgMTQuMDE5OSA5LjM2MiAxNC4zMDQ5IDkuMjI3TDEyLjk5OTkgNi4zMjdMMTEuNjk0OSA5LjIyN1pNMS42OTQ5MSA5LjIyN0MxLjk3OTkxIDkuMzYyIDIuNDEyOTEgOS41IDIuOTk5OTEgOS41QzMuNTg2OTEgOS41IDQuMDE5OTEgOS4zNjIgNC4zMDQ5MSA5LjIyN0wyLjk5OTkxIDYuMzI3TDEuNjk0OTEgOS4yMjdaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K&logoColor=white "License Link")](./LICENSE.MD) |

### 📚 Workspaces [🔝](#-backend-for-app-)

|     Name     |   Path   |     Description      |
| :----------: | :------: | :------------------: |
| `🎛️ Backend` | /backend | application Back-End |

### 📚 Deploy [🔝](#-backend-for-app-)

| Description |  Deploy | link |
| :-: | :-: | :-: |
| Backend | [![Vercel Link](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white 'Vercel Link')](https://vercel.com/) |[Back-End](https://apptestimonial.vercel.app/app/docs/) |
| Data Base | [![Postgres Link](https://img.shields.io/badge/Postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)| [PostgreSQL](https://github.com/No-Country-simulation/S11-25-Equipo-60-WebApp) |

## 🛠️ Guía de instalación [🔝](#-backend-for-app-)

### 📚 Comandos para instalar [🔝](#-backend-for-app-)

- Ejecuta el siguiente comando para instalar el proyecto:

```py
py -m venv venv 
```

```bash
.\venv\Scripts\activate
```

```py
pip install -r requirements.txt
```

### 📚 Crear un super usuario [🔝](#-backend-for-app-)

Para cerar un super usuario ejecute el siguiente comando y sigue los pasos

```py
python manage.py createsuperuser
```

### 📚 Levantar el backend [🔝](#-backend-for-app-)

El backend de la plataforma está construido en Django, para ejecutar el servidor de desarrollo backend debes ejecutar el siguiente comando:

```py
python manage.py runserver
```

Te diriges a la url localhost:8000 en el navegador

### ¡Y Listo! Has terminado de correr el backend 🥳 [🔝](#-backend-for-app-)
