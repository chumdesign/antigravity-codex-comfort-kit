# Antigravity Codex Comfort

Документация по кастомному улучшению интерфейса Codex внутри Google Antigravity.

## Что это такое

Этот набор файлов делает общение в Codex визуально комфортнее:

- увеличивает читаемость текста и кода
- расширяет полезную ширину контента
- добавляет режимы плотности чтения
- встраивает маленький переключатель режимов прямо в интерфейс
- позволяет быстро переустанавливать патч после обновления расширения

## Что было сделано

В расширение `openai.chatgpt-*` внутри Antigravity внедрены:

- кастомный CSS-файл с улучшенной типографикой
- кастомный JS-файл с UI-переключателем режимов
- патч `index.html`, который подключает оба файла

## Режимы чтения

Доступны три режима:

- `Compact` — ближе к стандартному виду
- `Comfort` — сбалансированный режим по умолчанию
- `Spacious` — более крупный и воздушный

Выбранный режим сохраняется в `localStorage`.

## Значения по умолчанию

Для режима `Comfort` используются такие настройки:

- обычный текст: `14px`
- код и мелкий текст: `13px`
- крупный текст: `17px`
- ширина основного контента: `52rem`
- ширина широких markdown-блоков: `62rem`
- `line-height` текста: `1.6`
- `line-height` кода: `1.65`

## Файлы проекта

Исходники и скрипты сохранены в этой папке проекта:

- [antigravity-codex-comfort.css](</h:/PROJECTS 2026/Tests/antigravity-codex-comfort.css>)
- [antigravity-codex-comfort.js](</h:/PROJECTS 2026/Tests/antigravity-codex-comfort.js>)
- [install-antigravity-codex-comfort.ps1](</h:/PROJECTS 2026/Tests/install-antigravity-codex-comfort.ps1>)
- [update-antigravity-codex-comfort.ps1](</h:/PROJECTS 2026/Tests/update-antigravity-codex-comfort.ps1>)

Эта документация:

- [ANTIGRAVITY_CODEX_COMFORT_README.md](</h:/PROJECTS 2026/Tests/ANTIGRAVITY_CODEX_COMFORT_README.md>)

## Куда это устанавливается

Патч ставится в актуальную папку расширения Antigravity, например:

`C:\Users\user\.antigravity\extensions\openai.chatgpt-26.415.20818-win32-x64\webview`

Внутрь `webview\assets` копируются:

- `antigravity-codex-comfort.css`
- `antigravity-codex-comfort.js`

А в `index.html` вставляются служебные маркеры:

- `antigravity-codex-comfort:style:start/end`
- `antigravity-codex-comfort:script:start/end`

## Как работает установка

Главный установщик:

```powershell
powershell -ExecutionPolicy Bypass -File "H:\PROJECTS 2026\Tests\install-antigravity-codex-comfort.ps1"
```

Он:

- сам ищет последнюю версию `openai.chatgpt-*` в `C:\Users\user\.antigravity\extensions`
- подключает CSS и JS в `index.html`
- создает резервную копию `index.html.bak`, если ее еще нет
- копирует актуальные asset-файлы в папку расширения
- умеет чистить старые маркеры прошлых версий патча

## Упрощенная команда после обновления

Если Antigravity обновился и патч слетел, достаточно выполнить:

```powershell
powershell -ExecutionPolicy Bypass -File "H:\PROJECTS 2026\Tests\update-antigravity-codex-comfort.ps1"
```

## Проверка статуса

```powershell
powershell -ExecutionPolicy Bypass -File "H:\PROJECTS 2026\Tests\update-antigravity-codex-comfort.ps1" -Status
```

## Удаление патча

```powershell
powershell -ExecutionPolicy Bypass -File "H:\PROJECTS 2026\Tests\update-antigravity-codex-comfort.ps1" -Uninstall
```

## Как пользоваться интерфейсом

В правом нижнем углу интерфейса появляется маленькая кнопка `Aa`.

Что она делает:

- раскрывает панель переключения режимов
- позволяет выбрать `Compact`, `Comfort` или `Spacious`
- позволяет скрыть панель, оставив компактную точку входа через `Aa`

## Важная особенность

Это неофициальный патч установленного расширения. После обновления Antigravity новая версия расширения обычно ставится в новую папку, поэтому патч нужно накатить заново через `update-antigravity-codex-comfort.ps1`.

## Что можно улучшить дальше

Если захочется развивать проект дальше, можно:

- добавить больше пресетов
- сделать отдельные настройки только для кода
- добавить визуально более нативную панель
- сделать автообновление через Scheduled Task
- добавить экспорт и импорт пользовательских настроек
