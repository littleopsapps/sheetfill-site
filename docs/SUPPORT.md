# Support — SheetFill

Most problems have a one-line answer. Start here.

## "It says it couldn't find a field"

The page changed, or you are on a slightly different version of the form. In the panel, click
**Re-teach a field**, click that field on the page, and pick its column again. Takes about five seconds.

## "Nothing happens when I click Fill next row"

1. Reload the page, then click the SheetFill icon again. Extensions cannot reach tabs that were
   already open when the extension was installed or updated.
2. Check that you have taught at least one field — the panel lists mapped fields.
3. If the page is a browser system page (settings, the store, a PDF viewer), extensions are not
   permitted to run there. That is a browser rule, not a SheetFill bug.

## "It filled the wrong values into the wrong boxes"

Click **Undo last fill** — it puts the previous values back and steps the row counter back. Then
check the mapped-fields list: each row reads *form field ← spreadsheet column*. Remove any wrong
one with ✕ and teach it again.

## "My columns came in as one column"

You copied a single column, or the paste arrived as plain text. Select the whole range in your
spreadsheet, copy, and paste again. SheetFill will tell you how many rows and columns it detected.

## "The dropdown didn't get set"

SheetFill matches a dropdown by option value, then by exact visible text, then by partial text. If
your spreadsheet says `UK` and the dropdown says `United Kingdom`, change the spreadsheet cell to
match the visible text. If nothing matches, SheetFill reports it rather than guessing.

## "I ran out of free rows"

The free plan is 15 filled rows per calendar month; it resets on the 1st. Your spreadsheet and
mappings are never lost when you hit the limit. Pro is $9/month for unlimited rows.

## "I bought Pro but it still says free"

Settings → paste your license key → **Activate**. The key is in your purchase email from Lemon
Squeezy. If it says the key is not recognised, check for a trailing space.

## "Does SheetFill send my spreadsheet anywhere?"

No. There is no server and no account. Everything is stored in your browser on your computer. The
only thing SheetFill ever sends is your license key, to check it is valid.

## "Can it submit the forms for me too?"

No, and it will not. SheetFill fills the fields; you review them and press submit. That is a
deliberate design decision — it keeps you in control of every record that gets created, and keeps
SheetFill on the right side of the rules of the sites you use.

## Contacting us

Email littleops.apps@gmail.com.

SheetFill is operated by Yuki Oebisu, an individual developer based in Japan. Address and telephone number will be provided without delay upon request.

Please include the output of **Settings → Copy diagnostics** (the extension version and your browser
version). It contains no spreadsheet data. Do **not** send us your spreadsheet — we do not need it
and we would rather not receive it.
