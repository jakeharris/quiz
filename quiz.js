function Answer(val, text) {
    this.val = typeof val !== 'undefined' ? val : 0;
    this.text = typeof text !== 'undefined' ? text : 'No answer text supplied.';
}
function Question(index, text, hasNullAnswer) {
    this.index = typeof index !== 'undefined' ? index : 1;
    this.text = typeof text !== 'undefined' ? text : 'No question text supplied.';
    this.hasNullAnswer = typeof hasNullAnswer !== 'undefined' ? hasNullAnswer : false; //really only storing this for debugging later

    this.answers = (this.hasNullAnswer) ? ANSWERS_WITH_NULL : ANSWERS;
    this.answer = ($('.answer:checked').length > 0) ? $('.answer:checked').val() : null;

    this.answersAsHtml = function () {
        var html = '<div class=\"btn-group\" data-toggle=\"buttons\">';

        for (var i = 0; i < this.answers.length; i++) {
            var a = this.answers[i];
            html += '<label class=\"btn btn-default\">';
            html +=     '<input type=\"radio\" class=\"answer\" name=\"question-' + this.index + '\" '
                            + 'data-question-number=\"' + this.index + '\" value=\"' + a.val + '\" checked=\"' + ((a == this.answer) ? 'checked' : '') + '\">';
            html +=         a.text;
            html +=     '</input>';
            html += '</label>';
        }

        html += '</div>';
        return html;
    }
}
function Topic(name, questions) {
    this.name = typeof name !== 'undefined' ? name : 'No topic name supplied.';
    this.questions = typeof questions !== 'undefined' ? questions : SPACE_AND_FURNISHINGS_QUESTIONS;

    this.i = 0;

    this.move = function (isMovingBack) {
        this.i += (!isMovingBack) ? 1 : -1;
    }
    this.currentQuestion = function () {
        return this.questions[this.i];
    }
}
function Quiz(topics) {
    //throw error if topics is undefined

    this.topics = (typeof topics !== undefined) ? topics : [];
    this.i = 0;
    this.complete = false;
    this.startMenu = {};
    this.progressMenu = {};

    this.move = function (isMovingBack) {
        // if we're at the end of a topic,
        // move to the next topic in that direction.
        // otherwise, just move questions in that direction
        // within the same topic.

        if (typeof isMovingBack === 'undefined') this.setValue(); //if we moved by setting a value
        if (this.topics[this.i].i >= this.topics[this.i].questions.length - 1 //if we're at the last position
            && this.i >= this.topics.length - 1
            && !isMovingBack) {
            return;
        }
        if (
            (this.topics[this.i].i >= this.topics[this.i].questions.length - 1 && !isMovingBack)
            ||
            (this.topics[this.i].i == 0 && isMovingBack)
           ) {

            this.i += (!isMovingBack) ? 1 : -1;
        } else {
            this.topics[this.i].move(isMovingBack);
        }
        this.setQuestion();
        this.placeArrows();
    };
    this.setValue = function () {
        var a = $('.answer:checked');
        if (a.length <= 0) return;

        $('#answers').children('input[type=hidden]')[a.attr('data-question-number') - 1].value = a.val();
        this.topics[this.i].currentQuestion().answer = a.val();
    };
    this.setQuestion = function () {
        // set the quiz question and answers
        var DOMquiz =  $($('.quiz').children('.quiz-scene')[0]);
        DOMquiz.children('.quiz-topic'   ).html(this.topics[this.i].name);
        DOMquiz.children('.quiz-question').html(this.topics[this.i].currentQuestion().text);
        DOMquiz.children('.quiz-answers').html(this.topics[this.i].currentQuestion().answersAsHtml());

        $('.answer[value="' + this.topics[this.i].currentQuestion().answer + '"]').parent('.btn').addClass('active');
    };
    this.placeArrows = function () {
        // create clickable arrows that let you go forward and backwards in the quiz

        if (this.i !== 0 || this.topics[this.i].i !== 0) $('.quiz-arrow--left').show(); else $('.quiz-arrow--left').hide();
        if (this.i !== this.topics.length - 1 || this.topics[this.i].i !== this.topics[this.i].questions.length - 1) $('.quiz-arrow--right').show(); else $('.quiz-arrow--right').hide();
    };
    this.isComplete = function () {
        var c = true;
        for (var t = 0; t < this.topics.length; t++) {
            for (var q = 0; q < this.topics[t].questions.length; q++) {
                if (this.topics[t].questions[q].answer === null) c = false;
            }
        }
        return c;
    };


    $(document).on('click', '.quiz-answers', function () {
        var a = $('.answer:checked');
        if (a.length <= 0) return;
        this.move();
        if (this.isComplete()) {
            $('.quiz-end').show();
            $('html, body').animate({ scrollTop: $(document).height() }, 1000);
            $(document).off('keyup');
        } else $('.quiz-end').hide();
    }.bind(this));
    $(document).on('click', '.quiz-arrow--left', function () {
        this.move(true);
    }.bind(this));
    $(document).on('click', '.quiz-arrow--right', function () {
        this.move(false);
    }.bind(this));
    $(document).on('click', '.quiz-enable', function () {
        $('.quiz-enable').remove();
        $(document).on('keyup', function (e) {
            var k = e.which,
                a = $('.answer');
            if (k > 57) k -= 48; // allow numpad entry
           a.filter('[value=' + String.fromCharCode(k) + ']').click();
        });
    }.bind(this));

    $('.bottom').hide();

    this.setQuestion();
    this.placeArrows();
};