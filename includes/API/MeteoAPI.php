<?php

namespace includes\API;
interface MeteoAPI
{
    function getData(string $url): string;
}

?>