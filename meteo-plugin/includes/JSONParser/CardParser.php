<?php

class CardParser implements JSONParser{
    /**
     * @param string|array $json
     * @return Cards[]
     */
    public function parseFromJSON($json): array{
        if (is_string($json)) {
            $data = json_decode($json, true);
        } elseif (is_array($json)) {
            $data = $json;
        } else {
            throw new InvalidArgumentException('Input non valido: deve essere JSON string o array.');
        }

        $newData = array_slice($data['cards'], 1);
        $newData = array_slice($newData, 0, -3);
        

        foreach ($newData as $item){
            $card = new Card(
                imageUrl: $item['i18n']['it-IT']['image']['src'],
                summaryText: $item['i18n']['it-IT']['text'],
                buttonText: $item['i18n']['it-IT']['button']['text']
            );
            $cards[] = $card;
        }
        
        return $cards;
    }
}

?>
