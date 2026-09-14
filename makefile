lua := $(shell command -v luajit 2>/dev/null || echo lua)
converter := esbeg.lua

sources := $(sort $(wildcard posts/*/index.md))
to_be_compiled_sources := $(sources) index.md about/index.md
to_be_compiled := $(to_be_compiled_sources:%.md=%.index)
outputs := $(sources:%.md=%.html)
indices := $(sources:%.md=%.index)
feeds := $(sources:%.md=%.rss)

all: posts/index.html $(to_be_compiled)

templates/post.html: templates/menubar.html

posts/index.html: templates/posts.html $(indices) 
	@echo MERGING
	@$(lua) $(converter) replace posts/index.html templates/posts.html $(indices)
	@$(lua) $(converter) replace rss.xml templates/rss.xml $(feeds)

%.index: %.md templates/post.html $(converter)
	@echo COMPILING $<
	@$(lua) $(converter) compile $< templates/post.html $(patsubst %.md,%.html,$<) $@ $(patsubst %.md,%.rss,$<)
