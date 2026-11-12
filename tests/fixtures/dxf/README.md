# DXF tool fixtures

Generated locally for this project from explicit DXF group/value pairs: three lines,
a circle and a text label on two layers. No customer drawings are included.

- ASCII AC1009 (R12) and AC1032 (2018).
- Binary AC1012 (R13) and AC1032: little-endian two-byte group codes,
  null-terminated strings, signed 16-bit integer tags and 64-bit float coordinates.
- Binary AC1009 uses the older one-byte group codes and must be rejected.

The binary files are test data, not another application file converter.
