<?php

namespace Meteouniparthenope\JSONParser;

interface JSONParser
{
    public function parseMultipleFromJSON($json): array;
    public function parseSingleFromJSON($json);
}

?>