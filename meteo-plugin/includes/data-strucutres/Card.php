<?php

class Card{
    private string $imageUrl;
    private string $summaryText;
    private string $buttonText;

    public function __construct(string $imageUrl, string $summaryText, string $buttonText){
        $this->imageUrl = $imageUrl;
        $this->summaryText = $summaryText;
        $this->buttonText = $buttonText;
    }

    public function getImageUrl(): string{
        return $this->imageUrl;
    }

    public function setImageUrl(string $imageUrl){
        $this->imageUrl = $imageUrl;
    }

    public function getSummaryText(): string{
        return $this->summaryText;
    }

    public function getButtonText(): string{
        return $this->buttonText;
    }

    public function toAssociativeArray(): array{
        return [
            'imageUrl' => $this->imageUrl,
            'summaryText' => $this->summaryText,
            'buttonText' => $this->buttonText,
        ];
    }
}

?>