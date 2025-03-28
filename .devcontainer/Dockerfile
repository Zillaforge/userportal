FROM node:18.20.6-alpine3.21


# Uses "Spaceship" theme with some customization. Uses some bundled plugins and installs some more from github
RUN sh -c "$(wget -O- https://github.com/deluan/zsh-in-docker/releases/download/v1.2.1/zsh-in-docker.sh)" -- \
    -t agnoster \
    -p git \
    -p z \
    -p https://github.com/zsh-users/zsh-autosuggestions \
    -a 'ZSH_AUTOSUGGEST_HIGHLIGHT_STYLE="fg=2"' \
    -p https://github.com/zsh-users/zsh-completions

RUN apk add zsh-vcs

RUN sed -i '/## Main/i prompt_newline() { \n\
if [[ -n $CURRENT_BG ]]; then\n\
    echo -n " %{%k%F{$CURRENT_BG}%}$SEGMENT_SEPARATOR\n\
%{%k%F{$CURRENT_BG}%}$SEGMENT_SEPARATOR"\n\
else\n\
    echo -n " %{%k%}"\n\
fi\n\
echo -n " %{%f%}"\n\
CURRENT_BG=''\n\
}' /root/.oh-my-zsh/themes/agnoster.zsh-theme
   
RUN sed -i 's/  prompt_hg/  prompt_hg\n  prompt_newline/' /root/.oh-my-zsh/themes/agnoster.zsh-theme